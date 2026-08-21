/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { fireEvent, render, waitFor } from '@testing-library/react';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { RouteComponentProps } from 'react-router-dom';
import { MOCK_DATA_ACTIVE_RESPONSE } from '../../../../test/mocks/mockData';
import {
  coreServicesMock,
  notificationServiceMock,
} from '../../../../test/mocks/serviceMock';
import { CoreServicesContext } from '../../../components/coreServices';
import { ServicesContext } from '../../../services';
import { ChannelDetails } from '../components/details/ChannelDetails';
import { setupCoreStart } from '../../../../test/utils/helpers';

jest.mock('../../../utils/helpers', () => ({
  ...jest.requireActual('../../../utils/helpers'),
  getActiveResponseExecutionsUrl: jest.fn(() => ''),
}));

const { getActiveResponseExecutionsUrl } = jest.requireMock('../../../utils/helpers');

const mockGetMonitorsUsingDestination = jest.fn();
jest.mock('../../../services/AlertingMonitorsService', () =>
  jest.fn().mockImplementation(() => ({
    getMonitorsUsingDestination: mockGetMonitorsUsingDestination,
  }))
);

beforeAll(() => {
  setupCoreStart();
});

beforeEach(() => {
  mockGetMonitorsUsingDestination.mockReset();
  mockGetMonitorsUsingDestination.mockRejectedValue(new Error('unavailable'));
});

afterEach(() => {
  getActiveResponseExecutionsUrl.mockReturnValue('');
});

describe('<ChannelDetails/> spec', () => {
  configure({ adapter: new Adapter() });

  it('renders the component', () => {
    const props = { match: { params: { id: 'test' } } };
    const utils = render(
      <ServicesContext.Provider value={notificationServiceMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ChannelDetails {...(props as RouteComponentProps<{ id: string }>)} />
        </CoreServicesContext.Provider>
      </ServicesContext.Provider>
    );
    expect(utils.container.firstChild).toMatchSnapshot();
  });

  it('renders a specific channel', async () => {
    const props = { match: { params: { id: 'test' } } };
    const notificationServiceMock = jest.fn() as any;
    notificationServiceMock.notificationService = {
      getChannel: async (id: string) => {
        return MOCK_DATA_ACTIVE_RESPONSE.activeResponse;
      },
    };
    let container = document.createElement('div');

    act(() => {
      ReactDOM.render(
        <ServicesContext.Provider value={notificationServiceMock}>
          <CoreServicesContext.Provider value={coreServicesMock}>
            <ChannelDetails
              {...(props as RouteComponentProps<{ id: string }>)}
            />
          </CoreServicesContext.Provider>
        </ServicesContext.Provider>,
        container
      );
    });
    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });

  it('handles a non-existing channel', async () => {
    const props = { match: { params: { id: 'test' } } };
    const notificationServiceMock = jest.fn() as any;
    notificationServiceMock.notificationService = {
      getChannel: async (id: string) => {
        throw "non existing channel"
      },
    };
    let container = document.createElement('div');

    act(() => {
      ReactDOM.render(
        <ServicesContext.Provider value={notificationServiceMock}>
          <CoreServicesContext.Provider value={coreServicesMock}>
            <ChannelDetails
              {...(props as RouteComponentProps<{ id: string }>)}
            />
          </CoreServicesContext.Provider>
        </ServicesContext.Provider>,
        container
      );
    });
    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });

  it('clicks mute button with channel', async () => {
    const props = { match: { params: { id: 'test' } } };
    const notificationServiceMock = jest.fn() as any;
    notificationServiceMock.notificationService = {
      getChannel: async (id: string) => {
        return MOCK_DATA_ACTIVE_RESPONSE.activeResponse;
      },
      updateConfig: jest.fn(),
    };

    const utils = render(
      <ServicesContext.Provider value={notificationServiceMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ChannelDetails {...(props as RouteComponentProps<{ id: string }>)} />
        </CoreServicesContext.Provider>
      </ServicesContext.Provider>
    );

    await waitFor(() => {
      utils.getByTestId('channel-details-mute-button').click();
    });
  });

  it('renders the view executions button when available', async () => {
    getActiveResponseExecutionsUrl.mockReturnValue(
      'http://localhost/app/incident-response-dashboard'
    );
    const props = { match: { params: { id: 'test' } } };
    const notificationServiceMock = jest.fn() as any;
    notificationServiceMock.notificationService = {
      getChannel: async (id: string) => {
        return MOCK_DATA_ACTIVE_RESPONSE.activeResponse;
      },
    };

    const utils = render(
      <ServicesContext.Provider value={notificationServiceMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ChannelDetails {...(props as RouteComponentProps<{ id: string }>)} />
        </CoreServicesContext.Provider>
      </ServicesContext.Provider>
    );

    await waitFor(() => {
      expect(utils.getByTestId('channel-details-view-executions-button')).toBeTruthy();
    });
    expect(getActiveResponseExecutionsUrl).toHaveBeenCalledWith(
      MOCK_DATA_ACTIVE_RESPONSE.activeResponse.name
    );
  });

  it('does not render the view executions button when unavailable', async () => {
    getActiveResponseExecutionsUrl.mockReturnValue('');
    const props = { match: { params: { id: 'test' } } };
    const notificationServiceMock = jest.fn() as any;
    notificationServiceMock.notificationService = {
      getChannel: async (id: string) => {
        return MOCK_DATA_ACTIVE_RESPONSE.activeResponse;
      },
    };

    const utils = render(
      <ServicesContext.Provider value={notificationServiceMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ChannelDetails {...(props as RouteComponentProps<{ id: string }>)} />
        </CoreServicesContext.Provider>
      </ServicesContext.Provider>
    );

    await waitFor(() => {
      expect(utils.queryByTestId('channel-details-mute-button')).toBeTruthy();
    });
    expect(utils.queryByTestId('channel-details-view-executions-button')).toBeNull();
  });

  it('renders the used by panel listing monitor names and count, each linking to its details page', async () => {
    mockGetMonitorsUsingDestination.mockResolvedValue([
      { id: 'monitor-id-1', name: 'monitor-1' },
      { id: 'monitor-id-2', name: 'monitor-2' },
    ]);
    const props = { match: { params: { id: 'test' } } };
    const notificationServiceMock = jest.fn() as any;
    notificationServiceMock.notificationService = {
      getChannel: async (id: string) => {
        return MOCK_DATA_ACTIVE_RESPONSE.activeResponse;
      },
    };

    const utils = render(
      <ServicesContext.Provider value={notificationServiceMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ChannelDetails {...(props as RouteComponentProps<{ id: string }>)} />
        </CoreServicesContext.Provider>
      </ServicesContext.Provider>
    );

    await waitFor(() => {
      const title = utils.getByText('Alerting monitors');
      expect(title.nextElementSibling?.textContent).toBe('2 (monitor-1, monitor-2)');
    });
    expect(
      utils.getByTestId('channel-details-used-by-monitor-link-monitor-id-1').textContent
    ).toBe('monitor-1');
    expect(
      utils.getByTestId('channel-details-used-by-monitor-link-monitor-id-2').textContent
    ).toBe('monitor-2');
  });

  it('renders the used by panel empty state when no monitors reference it', async () => {
    mockGetMonitorsUsingDestination.mockResolvedValue([]);
    const props = { match: { params: { id: 'test' } } };
    const notificationServiceMock = jest.fn() as any;
    notificationServiceMock.notificationService = {
      getChannel: async (id: string) => {
        return MOCK_DATA_ACTIVE_RESPONSE.activeResponse;
      },
    };

    const utils = render(
      <ServicesContext.Provider value={notificationServiceMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ChannelDetails {...(props as RouteComponentProps<{ id: string }>)} />
        </CoreServicesContext.Provider>
      </ServicesContext.Provider>
    );

    await waitFor(() => {
      const title = utils.getByText('Alerting monitors');
      expect(title.nextElementSibling?.textContent).toBe('—');
    });
  });

  it('shows the used by panel empty state when the lookup fails', async () => {
    const props = { match: { params: { id: 'test' } } };
    const notificationServiceMock = jest.fn() as any;
    notificationServiceMock.notificationService = {
      getChannel: async (id: string) => {
        return MOCK_DATA_ACTIVE_RESPONSE.activeResponse;
      },
    };

    const utils = render(
      <ServicesContext.Provider value={notificationServiceMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ChannelDetails {...(props as RouteComponentProps<{ id: string }>)} />
        </CoreServicesContext.Provider>
      </ServicesContext.Provider>
    );

    await waitFor(() => {
      expect(utils.queryByTestId('channel-details-mute-button')).toBeTruthy();
    });
    const title = utils.getByText('Alerting monitors');
    expect(title.nextElementSibling?.textContent).toBe('—');
  });

  it('clicks unmute button with channel', async () => {
    const props = { match: { params: { id: 'test' } } };
    const notificationServiceMock = jest.fn() as any;
    const updateConfig = jest.fn(async () => Promise.resolve());
    notificationServiceMock.notificationService = {
      getChannel: async (id: string) => {
        return MOCK_DATA_ACTIVE_RESPONSE.activeResponse;
      },
      updateConfig,
    };

    const utils = render(
      <ServicesContext.Provider value={notificationServiceMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ChannelDetails {...(props as RouteComponentProps<{ id: string }>)} />
        </CoreServicesContext.Provider>
      </ServicesContext.Provider>
    );

    await waitFor(() => {
      utils.getByTestId('channel-details-mute-button').click();
    });
  });
});
