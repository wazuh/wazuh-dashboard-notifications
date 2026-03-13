/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { MOCK_DATA, MOCK_DATA_ACTIVE_RESPONSE } from '../../../../test/mocks/mockData';
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

beforeAll(() => {
  setupCoreStart();
});

describe('<CreateChannel/> spec', () => {
  const updateConfigSuccess = jest.fn(async (configId: string, config: any) =>
    Promise.resolve()
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
    expect(utils.container.firstChild).toMatchSnapshot();
  });

  it('renders the component for editing active response', async () => {
    const notificationServiceMockSlack = jest.fn() as any;
    const getChannel = jest.fn(
      async (queryObject: object) => MOCK_DATA_ACTIVE_RESPONSE.activeResponse
    );
    notificationServiceMockSlack.notificationService = {
      getChannel: getChannel,
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
      expect(getChannel).toBeCalled();
    });

    utilsSlack.getByTestId('create-channel-create-button').click();
    await waitFor(() => {
      expect(updateConfigSuccess).toBeCalled();
    });
  });
});
