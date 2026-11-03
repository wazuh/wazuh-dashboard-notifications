/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from '@testing-library/react';
import { HOST_DENY_LIST_DOCUMENTATION_URL } from '../constants';
import { showTestMessageError } from '../testMessageErrorToast';

const failure = (statusText: string) => ({
  body: {
    message: `[status_exception] ${JSON.stringify({
      event_status_list: [
        { delivery_status: { status_code: '400', status_text: statusText } },
      ],
    })}`,
  },
});

const FALLBACK_MESSAGE = 'View error details and adjust the channel settings.';

describe('showTestMessageError', () => {
  it('links the documentation in the error toast when the host is denied', () => {
    const toasts = { addError: jest.fn() };

    showTestMessageError(
      toasts as any,
      failure(
        'Host of url is denied, based on plugin setting [host_deny_list]'
      ),
      FALLBACK_MESSAGE
    );

    const [error, { title, toastMessage }] = toasts.addError.mock.calls[0];
    expect(title).toBe('Failed to send the test message.');
    expect(error.stack).toContain('host_deny_list');
    const { container } = render(toastMessage);
    expect(
      container.querySelector(`a[href="${HOST_DENY_LIST_DOCUMENTATION_URL}"]`)
    ).not.toBeNull();
  });

  it('shows the fallback message when the failure is not explained', () => {
    const toasts = { addError: jest.fn() };
    const error = { body: { message: 'Internal Server Error' } };

    showTestMessageError(toasts as any, error, FALLBACK_MESSAGE);

    expect(toasts.addError).toHaveBeenCalledWith(error.body, {
      title: 'Failed to send the test message.',
      toastMessage: FALLBACK_MESSAGE,
    });
  });
});
