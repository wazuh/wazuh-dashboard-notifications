/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { applicationServiceMock } from '../../../../../../src/core/public/application/application_service.mock';
import { setApplication } from '../../../services/utils/constants';
import { setupCoreStart } from '../../../../test/utils/helpers';
import {
  ChannelsDescription,
  CHANNELS_DESCRIPTION,
  CHANNELS_MONITOR_HINT,
  getChannelsDescriptionControls,
} from '../components/ChannelsDescription';

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

const CREATE_MONITOR_URL = 'http://localhost/app/alerting#/create-monitor';

beforeAll(() => {
  setupCoreStart();
});

describe('<ChannelsDescription/> spec', () => {
  it('says what a channel is for and links to Create monitor', () => {
    const app = setupApplication({ alerting: true });
    const { getByTestId } = render(<ChannelsDescription />);

    expect(getByTestId('channels-description').textContent).toBe(
      `${CHANNELS_DESCRIPTION} ${CHANNELS_MONITOR_HINT}`
    );

    const link = getByTestId('channels-create-monitor-link');
    expect(link.getAttribute('href')).toBe(CREATE_MONITOR_URL);

    fireEvent.click(link);
    expect(app.navigateToApp).toHaveBeenCalledWith('alerting', {
      path: '#/create-monitor',
    });
  });

  it('leaves the Alerting step out when alerting is not installed', () => {
    setupApplication({});
    const { getByTestId, queryByTestId } = render(<ChannelsDescription />);

    expect(getByTestId('channels-description').textContent).toBe(
      CHANNELS_DESCRIPTION
    );
    expect(queryByTestId('channels-create-monitor-link')).toBeNull();
  });
});

describe('getChannelsDescriptionControls', () => {
  it('describes the page with a Create monitor link in the header', () => {
    setupApplication({ alerting: true });

    expect(getChannelsDescriptionControls()).toEqual([
      {
        description: `${CHANNELS_DESCRIPTION} ${CHANNELS_MONITOR_HINT}`,
        links: {
          label: 'Create monitor',
          href: CREATE_MONITOR_URL,
          controlType: 'link',
        },
      },
    ]);
  });

  it('only describes the page when alerting is not installed', () => {
    setupApplication({});

    expect(getChannelsDescriptionControls()).toEqual([
      { description: CHANNELS_DESCRIPTION },
    ]);
  });
});
