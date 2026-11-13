/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ChromeHelpExtension } from '../../../../src/core/public';
import { NOTIFICATIONS_DOCUMENTATION_URL } from './constants';

/**
 * Wazuh: adds the Notifications documentation, which explains what channels
 * are for, to the Help menu of the header. The core clears the extension when
 * the user switches to another application, so this runs on each mount.
 */
export function setNotificationsHelpExtension(
  chrome: { setHelpExtension: (helpExtension?: ChromeHelpExtension) => void },
  appName: string
): void {
  chrome.setHelpExtension({
    appName,
    links: [
      { linkType: 'documentation', href: NOTIFICATIONS_DOCUMENTATION_URL },
    ],
  });
}
