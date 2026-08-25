/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSmallButton } from '@elastic/eui';
import React from 'react';
import {
  getMonitorsAppUrl,
  handleMonitorsLinkClick,
} from '../../../utils/helpers';

/**
 * Shortcut that links to the Alerting > Monitors page.
 */
export function MonitorsShortcut() {
  return (
    <EuiSmallButton
      iconType="popout"
      iconSide="right"
      href={getMonitorsAppUrl()}
      onClick={handleMonitorsLinkClick}
      data-test-subj="monitors-shortcut-button"
    >
      Manage monitors
    </EuiSmallButton>
  );
}
