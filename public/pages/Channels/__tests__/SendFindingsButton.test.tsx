/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { applicationServiceMock } from '../../../../../../src/core/public/application/application_service.mock';
import { setApplication } from '../../../services/utils/constants';
import { setupCoreStart } from '../../../../test/utils/helpers';
import {
  mountSendFindingsToast,
  SendFindingsButton,
  SEND_FINDINGS_MUTED_TOOLTIP,
} from '../components/details/SendFindingsButton';

const setupApplication = (navLinks: Record<string, boolean>) => {
  const app = applicationServiceMock.createStartContract();
  app.capabilities = { ...app.capabilities, navLinks };
  (app.getUrlForApp as jest.Mock).mockImplementation(
    (appId: string, options: { path: string }) =>
      `http://localhost/app/${appId}${options.path}`
  );
  setApplication(app);
  return app;
};

const PRESET_URL =
  'http://localhost/app/alerting#/create-monitor?preset=findings&channelId=channel_id';

beforeAll(() => {
  setupCoreStart();
});

describe('<SendFindingsButton/> spec', () => {
  it('links to a monitor that sends findings to the channel', () => {
    const app = setupApplication({ alerting: true });
    const { getByTestId } = render(
      <SendFindingsButton channelId="channel_id" />
    );
    const button = getByTestId('send-findings-to-channel-button');

    expect(button.getAttribute('href')).toBe(PRESET_URL);
    expect(button.textContent).toBe('Send findings to this channel');

    fireEvent.click(button);
    expect(app.navigateToApp).toHaveBeenCalledWith('alerting', {
      path: '#/create-monitor?preset=findings&channelId=channel_id',
    });
  });

  it('is not rendered when the alerting app is not installed', () => {
    setupApplication({});
    const { container } = render(<SendFindingsButton channelId="channel_id" />);

    expect(container.firstChild).toBeNull();
  });

  it('is disabled and explains why when the channel is muted', async () => {
    const app = setupApplication({ alerting: true });
    const { getByTestId, findByText } = render(
      <SendFindingsButton channelId="channel_id" isMuted />
    );
    const button = getByTestId('send-findings-to-channel-button');

    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
    expect(app.navigateToApp).not.toHaveBeenCalled();

    fireEvent.mouseOver(button.parentElement!);
    expect(await findByText(SEND_FINDINGS_MUTED_TOOLTIP)).toBeTruthy();
  });
});

describe('mountSendFindingsToast', () => {
  it('renders the next step for the created channel and unmounts it', async () => {
    setupApplication({ alerting: true });
    const element = document.createElement('div');

    let unmount: () => void = () => {};
    act(() => {
      unmount = mountSendFindingsToast('channel_id')(element);
    });

    await waitFor(() => {
      expect(element.textContent).toContain(
        'Next, create a monitor that sends new findings to it.'
      );
    });
    expect(
      element
        .querySelector('[data-test-subj="send-findings-to-channel-button"]')
        ?.getAttribute('href')
    ).toBe(PRESET_URL);

    act(() => unmount());
    expect(element.childElementCount).toBe(0);
  });

  it('dismisses the toast when its button is used', async () => {
    setupApplication({ alerting: true });
    const dismiss = jest.fn();
    const element = document.createElement('div');
    act(() => {
      mountSendFindingsToast('channel_id', dismiss)(element);
    });

    const button = await waitFor(() => {
      const found = element.querySelector(
        '[data-test-subj="send-findings-to-channel-button"]'
      );
      expect(found).not.toBeNull();
      return found!;
    });
    act(() => {
      fireEvent.click(button);
    });

    expect(dismiss).toHaveBeenCalledTimes(1);
  });
});
