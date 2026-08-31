/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import moment from 'moment';
import 'moment-timezone';
import rison from 'rison-node';
import type { MouseEvent } from 'react';
import { getApplication, getUseUpdatedUx } from '../services/utils/constants';

const ALERTING_APP_ID = 'alerting';
const MONITORS_APP_ID = 'monitors';
const MONITORS_PATH = '#/monitors';

const INCIDENT_RESPONSE_APP_ID = 'incident-response-dashboard';
// Saved-object id of the wazuh-kibana-app-provisioned index pattern equals its
// title (wazuh-kibana-app plugins/main/server/plugin.ts, indexPatternID: WAZUH_ACTIVE_RESPONSES_PATTERN).
const ACTIVE_RESPONSES_INDEX_PATTERN_ID = 'wazuh-active-responses*';
// First approach: filters by name, the only correlation key wazuh-active-responses*
// currently indexes. Name isn't unique across renames/recreated configs, so the
// final solution should filter by config_id instead — that requires adding a
// config_id field to the wazuh-active-responses* documents and indexing it.
const ACTIVE_RESPONSE_NAME_FIELD = 'wazuh.active_response.name';
const ACTIVE_RESPONSES_TAB_PATH =
  '#overview/?tab=incident-response-dashboard&tabView=responses';
// 3-day window matches wazuh-active-responses*'s retention (vs. the 24h default
// wazuh-kibana-app's own Discover deep links use for longer-retention indices) —
// otherwise the first visit could silently clip up to 2 days of real executions.
const ACTIVE_RESPONSES_G_STATE =
  '(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-3d,to:now))';

export function getMonitorsAppUrl(): string {
  try {
    const app = getApplication();
    return getUseUpdatedUx()
      ? app.getUrlForApp(MONITORS_APP_ID, { path: MONITORS_PATH })
      : app.getUrlForApp(ALERTING_APP_ID, { path: MONITORS_PATH });
  } catch {
    return '';
  }
}

export function navigateToMonitorsApp(): void {
  const app = getApplication();
  if (getUseUpdatedUx()) {
    app.navigateToApp(MONITORS_APP_ID, { path: MONITORS_PATH });
  } else {
    app.navigateToApp(ALERTING_APP_ID, { path: MONITORS_PATH });
  }
}

export function handleMonitorsLinkClick(event: MouseEvent<HTMLElement>): void {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) {
    return; // let the browser handle open in new tab
  }
  event.preventDefault();
  navigateToMonitorsApp();
}

export function getMonitorDetailsUrl(monitorId: string): string {
  try {
    const app = getApplication();
    const path = `${MONITORS_PATH}/${monitorId}`;
    return getUseUpdatedUx()
      ? app.getUrlForApp(MONITORS_APP_ID, { path })
      : app.getUrlForApp(ALERTING_APP_ID, { path });
  } catch {
    return '';
  }
}

export function navigateToMonitorDetails(monitorId: string): void {
  const app = getApplication();
  const path = `${MONITORS_PATH}/${monitorId}`;
  if (getUseUpdatedUx()) {
    app.navigateToApp(MONITORS_APP_ID, { path });
  } else {
    app.navigateToApp(ALERTING_APP_ID, { path });
  }
}

export function handleMonitorDetailsLinkClick(
  event: MouseEvent<HTMLElement>,
  monitorId: string
): void {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) {
    return; // let the browser handle open in new tab
  }
  event.preventDefault();
  navigateToMonitorDetails(monitorId);
}

function buildActiveResponseExecutionsPath(name: string): string {
  const filterState = rison.encode({
    filters: [
      {
        meta: {
          alias: null,
          disabled: false,
          key: ACTIVE_RESPONSE_NAME_FIELD,
          value: name,
          params: name,
          negate: false,
          type: 'phrase',
          index: ACTIVE_RESPONSES_INDEX_PATTERN_ID,
        },
        query: {
          match_phrase: { [ACTIVE_RESPONSE_NAME_FIELD]: { query: name } },
        },
        $state: { store: 'appState' },
      },
    ],
    query: { language: 'kuery', query: '' },
  });
  return `${ACTIVE_RESPONSES_TAB_PATH}&_a=${filterState}&_g=${ACTIVE_RESPONSES_G_STATE}`;
}

function isIncidentResponseAppAvailable(): boolean {
  try {
    return Boolean(
      getApplication().capabilities.navLinks[INCIDENT_RESPONSE_APP_ID]
    );
  } catch {
    return false;
  }
}

export function getActiveResponseExecutionsUrl(name: string): string {
  if (!name || !isIncidentResponseAppAvailable()) return '';
  try {
    return getApplication().getUrlForApp(INCIDENT_RESPONSE_APP_ID, {
      path: buildActiveResponseExecutionsPath(name),
    });
  } catch {
    return '';
  }
}

export function navigateToActiveResponseExecutions(name: string): void {
  if (!isIncidentResponseAppAvailable()) return;
  getApplication().navigateToApp(INCIDENT_RESPONSE_APP_ID, {
    path: buildActiveResponseExecutionsPath(name),
  });
}

export function handleActiveResponseExecutionsLinkClick(
  event: MouseEvent<HTMLElement>,
  name: string
): void {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) {
    return; // let the browser handle open in new tab
  }
  event.preventDefault();
  navigateToActiveResponseExecutions(name);
}

export function getErrorMessage(err: any, defaultMessage?: string) {
  if (defaultMessage) return defaultMessage;
  if (err && err.message) console.error(defaultMessage, err);
  return '';
}

export const renderTime = (time: number): string => {
  // time is in milliseconds
  const momentTime = moment(time).local();
  const timezone = moment.tz(moment.tz.guess()).zoneAbbr();
  if (time && momentTime.isValid())
    return `${momentTime.format('MM/DD/YY h:mm a')} ${timezone}`;
  return '-';
};
