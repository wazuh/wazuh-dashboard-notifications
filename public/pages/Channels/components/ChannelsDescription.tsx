/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiLink } from '@elastic/eui';
import React from 'react';
import {
  getCreateMonitorUrl,
  handleCreateMonitorLinkClick,
} from '../../../utils/helpers';

export const CHANNELS_DESCRIPTION = 'Channels are where Wazuh sends messages.';
export const CHANNELS_MONITOR_HINT =
  'To send findings to a channel, create a monitor in Alerting.';

/**
 * Wazuh: a channel sends nothing by itself, so the Channels page says what
 * calls it. The Alerting step is left out when alerting is not installed.
 */
export function ChannelsDescription() {
  const createMonitorUrl = getCreateMonitorUrl();
  return (
    <span data-test-subj="channels-description">
      {CHANNELS_DESCRIPTION}
      {createMonitorUrl && (
        <>
          {' To send findings to a channel, '}
          {/* The href keeps "open in a new tab"; the click stays in the app */}
          {/* eslint-disable-next-line @elastic/eui/href-or-on-click */}
          <EuiLink
            href={createMonitorUrl}
            onClick={handleCreateMonitorLinkClick}
            data-test-subj="channels-create-monitor-link"
          >
            create a monitor in Alerting
          </EuiLink>
          .
        </>
      )}
    </span>
  );
}

/**
 * The same text for the updated UX header, which renders the description as
 * plain text followed by its links.
 */
export function getChannelsDescriptionControls() {
  const createMonitorUrl = getCreateMonitorUrl();
  if (!createMonitorUrl) return [{ description: CHANNELS_DESCRIPTION }];
  return [
    {
      description: `${CHANNELS_DESCRIPTION} ${CHANNELS_MONITOR_HINT}`,
      links: {
        label: 'Create monitor',
        href: createMonitorUrl,
        controlType: 'link' as const,
      },
    },
  ];
}
