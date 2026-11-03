/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiCodeBlock,
  EuiLink,
  EuiSpacer,
  EuiText,
  htmlIdGenerator,
} from '@elastic/eui';
import { i18n } from '@osd/i18n';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { CoreStart } from '../../../../src/core/public';
import { getTestMessageError, TestMessageError } from './helpers';

const TEST_MESSAGE_ERROR_TITLE = 'Failed to send the test message.';

function mountTestMessageError(testMessageError: TestMessageError) {
  return (element: HTMLElement) => {
    const root = createRoot(element);
    root.render(
      <>
        <EuiText size="s">
          <p>
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
          </p>
        </EuiText>
        <EuiSpacer size="s" />
        <EuiAccordion
          id={htmlIdGenerator('testMessageError')()}
          buttonContent={i18n.translate(
            'notificationsDashboards.testMessage.fullErrorButton',
            { defaultMessage: 'See the full error' }
          )}
        >
          <EuiCodeBlock
            fontSize="s"
            paddingSize="s"
            overflowHeight={200}
            isCopyable
          >
            {testMessageError.stack}
          </EuiCodeBlock>
        </EuiAccordion>
      </>
    );
    return () => root.unmount();
  };
}

/**
 * Wazuh: shows why a test message failed. A failure with a documented fix
 * links that documentation in the toast, since the error details modal can't.
 *
 * @param fallbackMessage shown when the failure doesn't explain itself
 */
export function showTestMessageError(
  toasts: CoreStart['notifications']['toasts'],
  error: any,
  fallbackMessage: string
) {
  const testMessageError = getTestMessageError(error);
  if (testMessageError?.documentationUrl) {
    toasts.addDanger({
      title: TEST_MESSAGE_ERROR_TITLE,
      text: mountTestMessageError(testMessageError),
    });
    return;
  }
  toasts.addError(testMessageError || error?.body || error, {
    title: TEST_MESSAGE_ERROR_TITLE,
    toastMessage: testMessageError?.message || fallbackMessage,
  });
}
