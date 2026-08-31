/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from '../../../../src/core/public';

const ALERTING_MONITORS_SEARCH_API = '/api/alerting/monitors/_search';
const ACTIVE_RESPONSE_MONITOR_TYPE = 'active_response_monitor';
// Bounds the fetch to what could possibly match; revisit with pagination if a
// deployment ever has more active response monitors than this.
const MAX_MONITORS = 200;

interface Action {
  destination_id?: string;
}

interface Trigger {
  // Only document_level_trigger is used by active_response_monitor today, but
  // the other trigger shapes are included for robustness.
  document_level_trigger?: { actions?: Action[] };
  query_level_trigger?: { actions?: Action[] };
  bucket_level_trigger?: { actions?: Action[] };
  chained_alert_trigger?: { actions?: Action[] };
}

interface MonitorHit {
  _id?: string;
  // The Alerting plugin's own _search REST handler flattens the underlying
  // index document (stored as { monitor: { name, triggers, ... } } per the
  // scheduled-jobs.json mapping) into a bare monitor object for its API
  // response — confirmed against a live cluster's /api/alerting/monitors/_search
  // output. Query field paths (e.g. monitor.monitor_type below) still use the
  // raw mapped path; only this response shape is flattened.
  _source?: {
    name?: string;
    triggers?: Trigger[];
  };
}

interface MonitorsSearchResponse {
  ok: boolean;
  resp?: {
    hits?: {
      hits?: MonitorHit[];
    };
  };
}

export interface AlertingMonitorSummary {
  id: string;
  name: string;
}

function triggerActions(trigger: Trigger): Action[] {
  return [
    ...(trigger.document_level_trigger?.actions ?? []),
    ...(trigger.query_level_trigger?.actions ?? []),
    ...(trigger.bucket_level_trigger?.actions ?? []),
    ...(trigger.chained_alert_trigger?.actions ?? []),
  ];
}

function monitorReferencesDestination(hit: MonitorHit, destinationId: string): boolean {
  const triggers = hit._source?.triggers ?? [];
  return triggers.some((trigger) =>
    triggerActions(trigger).some((action) => action.destination_id === destinationId)
  );
}

export default class AlertingMonitorsService {
  httpClient: HttpSetup;
  dataSourceId?: string;

  constructor(httpClient: HttpSetup, dataSourceId?: string) {
    this.httpClient = httpClient;
    this.dataSourceId = dataSourceId;
  }

  /**
   * Returns the Alerting monitors whose trigger actions reference the given
   * destination (a notification channel's config_id).
   *
   * Active response monitors are built on a document_level_trigger, and the
   * Alerting index mapping never indexes document_level_trigger.actions.destination_id
   * (confirmed against a live cluster and against both wazuh-indexer-alerting's and
   * upstream OpenSearch's scheduled-jobs.json mapping — `monitor` is `dynamic: "false"`
   * and only the generic `triggers.actions` and `triggers.query_level_trigger.actions`
   * shapes are declared), so a server-side destination_id filter can never match them.
   * Filtering server-side by the indexed `monitor.monitor_type` keyword instead, then
   * matching destination_id client-side against `_source`, works around that gap
   * without needing an indexer-side mapping change.
   */
  getMonitorsUsingDestination = async (destinationId: string): Promise<AlertingMonitorSummary[]> => {
    const esQuery = {
      size: MAX_MONITORS,
      query: {
        term: { 'monitor.monitor_type': ACTIVE_RESPONSE_MONITOR_TYPE },
      },
    };

    const response: MonitorsSearchResponse = await this.httpClient.post(
      ALERTING_MONITORS_SEARCH_API,
      {
        body: JSON.stringify({ query: esQuery }),
        query: this.dataSourceId ? { dataSourceId: this.dataSourceId } : undefined,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to look up monitors referencing this active response.');
    }

    const hits = response.resp?.hits?.hits ?? [];
    return hits
      .filter((hit) => monitorReferencesDestination(hit, destinationId))
      .map((hit) => ({ id: hit._id ?? '', name: hit._source?.name ?? '' }));
  };
}
