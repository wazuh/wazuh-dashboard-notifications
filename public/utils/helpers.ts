/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
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
const ACTIVE_RESPONSES_TAB_PATH = '#overview/?tab=incident-response-dashboard&tabView=responses';
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

export function handleMonitorsLinkClick(
  event: MouseEvent<HTMLElement>
): void {
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

// Wazuh: the alerting create monitor form opens set up to send new findings to
// the channel given in the URL.
const FINDINGS_MONITOR_PRESET = 'findings';

function getAlertingAppId(): string {
  return getUseUpdatedUx() ? MONITORS_APP_ID : ALERTING_APP_ID;
}

function getFindingsMonitorPath(channelId: string): string {
  return `#/create-monitor?preset=${FINDINGS_MONITOR_PRESET}&channelId=${encodeURIComponent(
    channelId
  )}`;
}

// The alerting plugin is optional, so links to it are only offered when its
// app is registered.
export function isAlertingAppAvailable(): boolean {
  try {
    return Boolean(getApplication().capabilities.navLinks[getAlertingAppId()]);
  } catch {
    return false;
  }
}

export function getFindingsMonitorUrl(channelId: string): string {
  if (!channelId || !isAlertingAppAvailable()) return '';
  try {
    return getApplication().getUrlForApp(getAlertingAppId(), {
      path: getFindingsMonitorPath(channelId),
    });
  } catch {
    return '';
  }
}

export function navigateToFindingsMonitor(channelId: string): void {
  if (!isAlertingAppAvailable()) return;
  getApplication().navigateToApp(getAlertingAppId(), {
    path: getFindingsMonitorPath(channelId),
  });
}

export function handleFindingsMonitorLinkClick(
  event: MouseEvent<HTMLElement>,
  channelId: string
): void {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) {
    return; // let the browser handle open in new tab
  }
  event.preventDefault();
  navigateToFindingsMonitor(channelId);
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
        query: { match_phrase: { [ACTIVE_RESPONSE_NAME_FIELD]: { query: name } } },
        $state: { store: 'appState' },
      },
    ],
    query: { language: 'kuery', query: '' },
  });
  return `${ACTIVE_RESPONSES_TAB_PATH}&_a=${filterState}&_g=${ACTIVE_RESPONSES_G_STATE}`;
}

function isIncidentResponseAppAvailable(): boolean {
  try {
    return Boolean(getApplication().capabilities.navLinks[INCIDENT_RESPONSE_APP_ID]);
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

// Wazuh: explain why a test message failed instead of showing the raw response.
const HOST_DENY_LIST_SETTING =
  'opensearch.notifications.core.http.host_deny_list';

function getDeliveryStatusText(details: string): string | undefined {
  try {
    // The indexer reports the failure as `[status_exception] {"event_status_list":[...]}`
    const payload = JSON.parse(details.slice(details.indexOf('{')));
    const status = (payload.event_status_list ?? payload.status_list)?.[0];
    return status?.delivery_status?.status_text || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Returns the error to show when a test message fails, or undefined when the
 * failure doesn't report a delivery status. Its message explains the failure
 * and its stack keeps the raw response, shown under "See the full error".
 */
export function getTestMessageError(error: any): Error | undefined {
  // A failed request carries the indexer response in its body. A failed
  // delivery that sendTestMessage throws carries it in its stack.
  const details =
    typeof error?.body?.message === 'string'
      ? error.body.message
      : error?.stack;
  const statusText =
    typeof details === 'string' ? getDeliveryStatusText(details) : undefined;
  if (!statusText) return undefined;

  const testMessageError = new Error(
    statusText.includes('host_deny_list')
      ? i18n.translate('notificationsDashboards.testMessage.hostDeniedError', {
          defaultMessage:
            'The host of the URL is blocked by the indexer setting {setting}. Ask an administrator to update it.',
          values: { setting: HOST_DENY_LIST_SETTING },
        })
      : statusText
  );
  testMessageError.stack = details;
  return testMessageError;
}

export const renderTime = (time: number): string => {
  // time is in milliseconds
  const momentTime = moment(time).local();
  const timezone = moment.tz(moment.tz.guess()).zoneAbbr();
  if (time && momentTime.isValid())
    return `${momentTime.format('MM/DD/YY h:mm a')} ${timezone}`;
  return '-';
};
