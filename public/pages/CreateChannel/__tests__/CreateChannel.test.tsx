/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { MOCK_DATA } from '../../../../test/mocks/mockData';
import {
  coreServicesMock,
  mainStateMock,
  notificationServiceMock,
} from '../../../../test/mocks/serviceMock';
import { CoreServicesContext } from '../../../components/coreServices';
import { ServicesContext } from '../../../services';
import { MainContext } from '../../Main/Main';
import { CreateChannel } from '../CreateChannel';
import { setupCoreStart } from '../../../../test/utils/helpers';
import { applicationServiceMock } from '../../../../../../src/core/public/application/application_service.mock';
import { setApplication } from '../../../services/utils/constants';

beforeAll(() => {
  setupCoreStart();
});

describe('<CreateChannel/> spec', () => {
    const updateConfigSuccess = jest.fn(async (configId: string, config: any) =>
      Promise.resolve()
    );
    const updateConfigFailure = jest.fn(async (configId: string, config: any) =>
      Promise.reject()
    );
  it('renders the component', () => {
    const props = { match: { params: { id: 'test' } } };
    const utils = render(
      <MainContext.Provider value={mainStateMock}>
        <ServicesContext.Provider value={notificationServiceMock}>
          <CoreServicesContext.Provider value={coreServicesMock}>
            <CreateChannel
              {...(props as RouteComponentProps<{ id: string }>)}
            />
          </CoreServicesContext.Provider>
        </ServicesContext.Provider>
      </MainContext.Provider>
    );
    utils.getByTestId('create-channel-create-button').click();
    utils.getByTestId('create-channel-send-test-message-button').click();
    expect(utils.container.firstChild).toMatchSnapshot();
  });

  it('renders the component without SMTP sender type', async () => {
    const notificationServiceMockEmail = jest.fn() as any;
    const getEmailChannel = jest.fn(
        async (queryObject: object) => MOCK_DATA.email
    );
    notificationServiceMockEmail.notificationService = {
      getChannel: getEmailChannel,
      getSenders: jest.fn(async (query) => MOCK_DATA.senders),
      getEmailConfigDetails: jest.fn(async (channel) =>
          Promise.resolve(channel)
      ),
      updateConfig: updateConfigSuccess,
    };
    const props = {
      location: { search: '' },
      match: { params: { id: 'test' } },
    };
    const mainState = { ...mainStateMock,
      availableConfigTypes: [
        'slack',
        'chime',
        'microsoft_teams',
        'webhook',
        'email',
        'sns',
        'ses_account',
        'email_group',
        'active_response' // Wazuh
      ],
    };

    render(
        <MainContext.Provider value={mainState}>
          <ServicesContext.Provider value={notificationServiceMockEmail}>
            <CoreServicesContext.Provider value={coreServicesMock}>
              <CreateChannel
                  {...(props as RouteComponentProps<{ id: string }>)}
                  edit={true}
              />
            </CoreServicesContext.Provider>
          </ServicesContext.Provider>
        </MainContext.Provider>
    );

    expect(await screen.queryByText('Sender type')).toBeNull();
    expect(await screen.queryByText('SMTP sender')).toBeNull();
  });

  it('renders the component for editing slack', async () => {
    const notificationServiceMockSlack = jest.fn() as any;
    const getSlackChannel = jest.fn(
      async (queryObject: object) => MOCK_DATA.slack
    );
    notificationServiceMockSlack.notificationService = {
      getChannel: getSlackChannel,
      updateConfig: updateConfigSuccess,
    };
    const props = {
      location: { search: '' },
      match: { params: { id: 'test' } },
    };
    const utilsSlack = render(
      <MainContext.Provider value={mainStateMock}>
        <ServicesContext.Provider value={notificationServiceMockSlack}>
          <CoreServicesContext.Provider value={coreServicesMock}>
            <CreateChannel
              {...(props as RouteComponentProps<{ id: string }>)}
              edit={true}
            />
          </CoreServicesContext.Provider>
        </ServicesContext.Provider>
      </MainContext.Provider>
    );

    await waitFor(() => {
      expect(getSlackChannel).toBeCalled();
    });

    utilsSlack.getByTestId('create-channel-create-button').click();
    utilsSlack.getByTestId('create-channel-send-test-message-button').click();
    await waitFor(() => {
      expect(updateConfigSuccess).toBeCalled();
    });
  });

  it('renders the component for editing chime', async () => {
    const notificationServiceMockChime = jest.fn() as any;
    const getChimeChannel = jest.fn(
      async (queryObject: object) => MOCK_DATA.chime
    );
    notificationServiceMockChime.notificationService = {
      getChannel: getChimeChannel,
      updateConfig: updateConfigFailure,
    };
    const props = {
      location: { search: '' },
      match: { params: { id: 'test' } },
    };
    const utilsChime = render(
      <MainContext.Provider value={mainStateMock}>
        <ServicesContext.Provider value={notificationServiceMockChime}>
          <CoreServicesContext.Provider value={coreServicesMock}>
            <CreateChannel
              {...(props as RouteComponentProps<{ id: string }>)}
              edit={true}
            />
          </CoreServicesContext.Provider>
        </ServicesContext.Provider>
      </MainContext.Provider>
    );

    await waitFor(() => {
      expect(getChimeChannel).toBeCalled();
    });

    utilsChime.getByTestId('create-channel-create-button').click();
    await waitFor(() => {
      expect(updateConfigFailure).toBeCalled();
    });
  });

  it('renders the component for editing microsoft teams', async () => {
    const notificationServiceMockMicrosoftTeams = jest.fn() as any;
    const getMicrosoftTeamsChannel = jest.fn(
      async (queryObject: object) => MOCK_DATA.microsoftTeams
    );
    notificationServiceMockMicrosoftTeams.notificationService = {
      getChannel: getMicrosoftTeamsChannel,
      updateConfig: updateConfigFailure,
    };
    const props = {
      location: { search: '' },
      match: { params: { id: 'test' } },
    };
    const utilsMicrosoftTeams = render(
      <MainContext.Provider value={mainStateMock}>
        <ServicesContext.Provider value={notificationServiceMockMicrosoftTeams}>
          <CoreServicesContext.Provider value={coreServicesMock}>
            <CreateChannel
              {...(props as RouteComponentProps<{ id: string }>)}
              edit={true}
            />
          </CoreServicesContext.Provider>
        </ServicesContext.Provider>
      </MainContext.Provider>
    );

    await waitFor(() => {
      expect(getMicrosoftTeamsChannel).toBeCalled();
    });

    utilsMicrosoftTeams.getByTestId('create-channel-create-button').click();
    await waitFor(() => {
      expect(updateConfigFailure).toBeCalled();
    });
  });

  it('renders the component for editing email', async () => {
    const notificationServiceMockEmail = jest.fn() as any;
    const getEmailChannel = jest.fn(
      async (queryObject: object) => MOCK_DATA.email
    );
    notificationServiceMockEmail.notificationService = {
      getChannel: getEmailChannel,
      getSenders: jest.fn(async (query) => MOCK_DATA.senders),
      getEmailConfigDetails: jest.fn(async (channel) =>
        Promise.resolve(channel)
      ),
      updateConfig: updateConfigSuccess,
    };
    const props = {
      location: { search: '' },
      match: { params: { id: 'test' } },
    };
    const utilsEmail = render(
      <MainContext.Provider value={mainStateMock}>
        <ServicesContext.Provider value={notificationServiceMockEmail}>
          <CoreServicesContext.Provider value={coreServicesMock}>
            <CreateChannel
              {...(props as RouteComponentProps<{ id: string }>)}
              edit={true}
            />
          </CoreServicesContext.Provider>
        </ServicesContext.Provider>
      </MainContext.Provider>
    );

    await waitFor(() => {
      expect(getEmailChannel).toBeCalled();
    });

    utilsEmail.getByTestId('create-channel-create-button').click();
    await waitFor(() => {
      expect(updateConfigSuccess).toBeCalled();
    });
  });

  it('renders the component for editing email with SES', async () => {
    const notificationServiceMockEmail = jest.fn() as any;
    const getEmailChannel = jest.fn(
      async (queryObject: object) => MOCK_DATA.emailWithSES
    );
    notificationServiceMockEmail.notificationService = {
      getChannel: getEmailChannel,
      getSenders: jest.fn(async (query) => MOCK_DATA.senders),
      getEmailConfigDetails: jest.fn(async (channel) =>
        Promise.resolve(channel)
      ),
      updateConfig: updateConfigSuccess,
    };
    const props = {
      location: { search: '' },
      match: { params: { id: 'test' } },
    };
    const utilsEmail = render(
      <MainContext.Provider value={mainStateMock}>
        <ServicesContext.Provider value={notificationServiceMockEmail}>
          <CoreServicesContext.Provider value={coreServicesMock}>
            <CreateChannel
              {...(props as RouteComponentProps<{ id: string }>)}
              edit={true}
            />
          </CoreServicesContext.Provider>
        </ServicesContext.Provider>
      </MainContext.Provider>
    );

    await waitFor(() => {
      expect(getEmailChannel).toBeCalled();
    });
  });

  it('renders the component for editing webhook', async () => {
    const notificationServiceMockWebhook = jest.fn() as any;
    const getWebhookChannel = jest.fn(
      async (queryObject: object) => MOCK_DATA.webhook
    );
    notificationServiceMockWebhook.notificationService = {
      getChannel: getWebhookChannel,
      updateConfig: updateConfigSuccess,
    };
    const props = {
      location: { search: '' },
      match: { params: { id: 'test' } },
    };
    const utilsWebhook = render(
      <MainContext.Provider value={mainStateMock}>
        <ServicesContext.Provider value={notificationServiceMockWebhook}>
          <CoreServicesContext.Provider value={coreServicesMock}>
            <CreateChannel
              {...(props as RouteComponentProps<{ id: string }>)}
              edit={true}
            />
          </CoreServicesContext.Provider>
        </ServicesContext.Provider>
      </MainContext.Provider>
    );

    await waitFor(() => {
      expect(getWebhookChannel).toBeCalled();
    });

    utilsWebhook.getByTestId('create-channel-create-button').click();
    await waitFor(() => {
      expect(updateConfigSuccess).toBeCalled();
    });
  });

  it('renders the component for editing sns', async () => {
    const notificationServiceMockSNS = jest.fn() as any;
    const getSNSChannel = jest.fn(async (queryObject: object) => MOCK_DATA.sns);
    notificationServiceMockSNS.notificationService = {
      getChannel: getSNSChannel,
      updateConfig: updateConfigSuccess,
    };
    const props = {
      location: { search: '' },
      match: { params: { id: 'test' } },
    };
    const utilsSNS = render(
      <MainContext.Provider value={mainStateMock}>
        <ServicesContext.Provider value={notificationServiceMockSNS}>
          <CoreServicesContext.Provider value={coreServicesMock}>
            <CreateChannel
              {...(props as RouteComponentProps<{ id: string }>)}
              edit={true}
            />
          </CoreServicesContext.Provider>
        </ServicesContext.Provider>
      </MainContext.Provider>
    );

    await waitFor(() => {
      expect(getSNSChannel).toBeCalled();
    });

    utilsSNS.getByTestId('create-channel-create-button').click();
    await waitFor(() => {
      expect(updateConfigSuccess).toBeCalled();
    });
  });
});

// Wazuh
describe('<CreateChannel/> after creating a channel', () => {
  const createChannel = (navLinks: Record<string, boolean>) => {
    const app = applicationServiceMock.createStartContract();
    app.capabilities = { ...app.capabilities, navLinks };
    setApplication(app);

    const services = {
      notificationService: {
        createConfig: jest.fn(async () => ({ config_id: 'new_channel_id' })),
      },
    } as any;
    const props: any = { match: { params: {} }, location: { search: '' } };
    const utils = render(
      <MainContext.Provider value={mainStateMock}>
        <ServicesContext.Provider value={services}>
          <CoreServicesContext.Provider value={coreServicesMock}>
            <CreateChannel {...props} />
          </CoreServicesContext.Provider>
        </ServicesContext.Provider>
      </MainContext.Provider>
    );
    fireEvent.change(utils.getByTestId('create-channel-name-input'), {
      target: { value: 'SOC Slack' },
    });
    fireEvent.change(utils.getByTestId('create-channel-slack-webhook-input'), {
      target: { value: 'https://hooks.slack.com/services/test' },
    });
    fireEvent.click(utils.getByTestId('create-channel-create-button'));
    return services.notificationService.createConfig;
  };

  beforeEach(() => {
    (coreServicesMock.notifications.toasts.addSuccess as jest.Mock).mockClear();
  });

  it('offers to send findings to the new channel', async () => {
    const createConfig = createChannel({ alerting: true });

    await waitFor(() => {
      expect(
        coreServicesMock.notifications.toasts.addSuccess
      ).toHaveBeenCalledWith({
        title: 'Channel SOC Slack successfully created.',
        text: expect.any(Function),
        toastLifeTimeMs: 20000,
      });
    });
    expect(createConfig).toHaveBeenCalled();
  });

  it('only confirms the creation when the alerting app is not installed', async () => {
    createChannel({});

    await waitFor(() => {
      expect(
        coreServicesMock.notifications.toasts.addSuccess
      ).toHaveBeenCalledWith('Channel SOC Slack successfully created.');
    });
  });
});
