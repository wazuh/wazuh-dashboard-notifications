/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiHealth, EuiToolTip } from '@elastic/eui';
import React from 'react';

export const CHANNEL_MUTED_TOOLTIP =
  'This channel sends nothing until you unmute it.';

interface ChannelStatusProps {
  isEnabled: boolean;
}

/**
 * Wazuh: status of a channel. "Muted" explains itself, since a muted channel
 * drops every message sent to it.
 */
export function ChannelStatus({ isEnabled }: ChannelStatusProps) {
  if (isEnabled) return <EuiHealth color="success">Active</EuiHealth>;
  return (
    <EuiToolTip content={CHANNEL_MUTED_TOOLTIP}>
      <EuiHealth color="subdued" tabIndex={0} data-test-subj="channel-muted">
        Muted
      </EuiHealth>
    </EuiToolTip>
  );
}
