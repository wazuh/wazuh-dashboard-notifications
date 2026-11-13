/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiLink } from '@elastic/eui';
import { i18n } from '@osd/i18n';
import React from 'react';
import { CoreStart } from '../../../../src/core/public';
import { getTestMessageError } from './helpers';

const TEST_MESSAGE_ERROR_TITLE = 'Failed to send the test message.';

/**
 * Wazuh: shows why a test message failed. A failure with a documented fix
 * links that documentation in the toast message; "See the full error" keeps
 * the raw response.
 *
 * @param fallbackMessage shown when the failure doesn't explain itself
 */
export function showTestMessageError(
  toasts: CoreStart['notifications']['toasts'],
  error: any,
  fallbackMessage: string
) {
  const testMessageError = getTestMessageError(error);
  const toastMessage = testMessageError?.documentationUrl ? (
    <>
      {testMessageError.message}{' '}
      <EuiLink
        href={testMessageError.documentationUrl}
        target="_blank"
        external
      >
        {i18n.translate(
          'notificationsDashboards.testMessage.documentationLink',
          { defaultMessage: 'Learn how to allow the host' }
        )}
      </EuiLink>
    </>
  ) : (
    testMessageError?.message || fallbackMessage
  );

  toasts.addError(testMessageError || error?.body || error, {
    title: TEST_MESSAGE_ERROR_TITLE,
    // The error toast renders its message as a React node, although it is
    // typed as a string.
    toastMessage: toastMessage as string,
  });
}
