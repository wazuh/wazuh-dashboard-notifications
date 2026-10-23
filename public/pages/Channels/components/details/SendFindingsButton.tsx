/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSmallButton,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  getFindingsMonitorUrl,
  handleFindingsMonitorLinkClick,
} from '../../../../utils/helpers';

export const SEND_FINDINGS_LABEL = 'Send findings to this channel';
export const SEND_FINDINGS_MUTED_TOOLTIP =
  'Unmute the channel to send findings to it.';
// The toast holds an action, so it stays longer than an informative one.
export const SEND_FINDINGS_TOAST_LIFETIME_MS = 20000;

interface SendFindingsButtonProps {
  channelId: string;
  isMuted?: boolean;
  fill?: boolean;
  onClick?: () => void;
}

/**
 * Wazuh: leads from a channel to a monitor that sends new findings to it. It is
 * not rendered when the alerting plugin is not installed.
 */
export function SendFindingsButton({
  channelId,
  isMuted = false,
  fill = false,
  onClick,
}: SendFindingsButtonProps) {
  const href = getFindingsMonitorUrl(channelId);
  if (!href) return null;

  const button = (
    <EuiSmallButton
      fill={fill}
      href={href}
      isDisabled={isMuted}
      onClick={(event: React.MouseEvent<HTMLElement>) => {
        onClick?.();
        handleFindingsMonitorLinkClick(event, channelId);
      }}
      data-test-subj="send-findings-to-channel-button"
    >
      {SEND_FINDINGS_LABEL}
    </EuiSmallButton>
  );

  // A monitor would be created for a channel that does not send anything.
  return isMuted ? (
    <EuiToolTip content={SEND_FINDINGS_MUTED_TOOLTIP}>{button}</EuiToolTip>
  ) : (
    button
  );
}

/**
 * Wazuh: body of the toast shown once a channel is created, as a mount point
 * for the core toasts service.
 *
 * @param onClick dismisses the toast, which would otherwise cover the form it
 * leads to
 */
export function mountSendFindingsToast(
  channelId: string,
  onClick?: () => void
) {
  return (element: HTMLElement) => {
    const root = createRoot(element);
    root.render(
      <>
        <EuiText size="s">
          <p>Next, create a monitor that sends new findings to it.</p>
        </EuiText>
        <EuiFlexGroup justifyContent="flexEnd" gutterSize="s">
          <EuiFlexItem grow={false}>
            <SendFindingsButton channelId={channelId} onClick={onClick} />
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
    return () => root.unmount();
  };
}
