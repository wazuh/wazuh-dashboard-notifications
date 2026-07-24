/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import moment from 'moment';
import 'moment-timezone';
import type { MouseEvent } from 'react';
import { getApplication, getUseUpdatedUx } from '../services/utils/constants';

const ALERTING_APP_ID = 'alerting';
const MONITORS_APP_ID = 'monitors';
const MONITORS_PATH = '#/monitors';

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
