/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiSmallButton,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import React, { useState } from 'react';
import { ALERTING_DOCUMENTATION_LINK } from '../../../utils/constants';
import {
  getMonitorsAppUrl,
  handleMonitorsLinkClick,
} from '../../../utils/helpers';

/**
 * Shortcut that links to the Alerting > Monitors page, with an info popover
 * explaining the relationship between an active response and its monitor.
 */
export function MonitorsShortcut() {
  const [infoPopoverOpen, setInfoPopoverOpen] = useState(false);

  return (
    <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
      <EuiFlexItem grow={false}>
        <EuiSmallButton
          iconType="popout"
          iconSide="right"
          href={getMonitorsAppUrl()}
          onClick={handleMonitorsLinkClick}
          data-test-subj="monitors-shortcut-button"
        >
          Manage monitors
        </EuiSmallButton>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiPopover
          button={
            <EuiButtonIcon
              iconType="iInCircle"
              aria-label="About active responses and monitors"
              onClick={() => setInfoPopoverOpen(!infoPopoverOpen)}
              color="primary"
              data-test-subj="monitors-shortcut-info-button"
            />
          }
          isOpen={infoPopoverOpen}
          closePopover={() => setInfoPopoverOpen(false)}
          anchorPosition="downRight"
        >
          <div style={{ width: '300px' }}>
            <EuiText size="s">
              <strong>Active responses &amp; monitors</strong>
            </EuiText>
            <EuiSpacer size="s" />
            <EuiText size="xs">
              <p>
                An active response is executed as an action of an Alerting
                monitor. Open Monitors to create or edit the monitor that
                triggers it.
              </p>
            </EuiText>
            <EuiSpacer size="s" />
          </div>
        </EuiPopover>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
