/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { act, waitFor } from '@testing-library/react';
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

const createToasts = () => ({ addDanger: jest.fn(), addError: jest.fn() });

describe('showTestMessageError', () => {
  it('links the documentation when the host is denied', async () => {
    const toasts = createToasts();

    showTestMessageError(
      toasts as any,
      failure(
        'Host of url is denied, based on plugin setting [host_deny_list]'
      ),
      FALLBACK_MESSAGE
    );

    expect(toasts.addError).not.toHaveBeenCalled();
    const { title, text } = toasts.addDanger.mock.calls[0][0];
    expect(title).toBe('Failed to send the test message.');

    const element = document.createElement('div');
    let unmount: () => void = () => {};
    act(() => {
      unmount = text(element);
    });
    await waitFor(() => {
      expect(
        element.querySelector(`a[href="${HOST_DENY_LIST_DOCUMENTATION_URL}"]`)
      ).not.toBeNull();
    });
    act(() => unmount());
  });

  it('shows the fallback message when the failure is not explained', () => {
    const toasts = createToasts();
    const error = { body: { message: 'Internal Server Error' } };

    showTestMessageError(toasts as any, error, FALLBACK_MESSAGE);

    expect(toasts.addDanger).not.toHaveBeenCalled();
    expect(toasts.addError).toHaveBeenCalledWith(error.body, {
      title: 'Failed to send the test message.',
      toastMessage: FALLBACK_MESSAGE,
    });
  });
});
