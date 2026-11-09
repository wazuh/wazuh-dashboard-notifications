/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NOTIFICATIONS_DOCUMENTATION_URL } from '../constants';
import { setNotificationsHelpExtension } from '../helpExtension';

describe('setNotificationsHelpExtension', () => {
  it('links the Notifications docs of this version from the Help menu', () => {
    const chrome = { setHelpExtension: jest.fn() };

    setNotificationsHelpExtension(chrome, 'Notifications');

    expect(chrome.setHelpExtension).toHaveBeenCalledWith({
      appName: 'Notifications',
      links: [
        { linkType: 'documentation', href: NOTIFICATIONS_DOCUMENTATION_URL },
      ],
    });
    expect(NOTIFICATIONS_DOCUMENTATION_URL).toBe(
      'https://documentation.wazuh.com/5.0/user-manual/wazuh-indexer/modules/notifications.html'
    );
  });
});
