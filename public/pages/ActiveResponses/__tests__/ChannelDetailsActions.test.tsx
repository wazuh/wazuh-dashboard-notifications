/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, act, fireEvent, waitFor } from '@testing-library/react';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { MOCK_DATA } from '../../../../test/mocks/mockData';
import {
  coreServicesMock,
  notificationServiceMock,
} from '../../../../test/mocks/serviceMock';
import { CoreServicesContext } from '../../../components/coreServices';
import { ServicesContext } from '../../../services';
import { ChannelDetailsActions } from '../components/details/ChannelDetailsActions';
import { setupCoreStart } from '../../../../test/utils/helpers';

beforeAll(() => {
  setupCoreStart();
});

describe('<ChannelDetailsActions /> spec', () => {
  configure({ adapter: new Adapter() });

  it('renders the component', () => {
    const channel = MOCK_DATA.chime;
    const utils = render(
      <ServicesContext.Provider value={notificationServiceMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ChannelDetailsActions channel={channel} />
        </CoreServicesContext.Provider>
      </ServicesContext.Provider>
    );
    expect(utils.container.firstChild).toMatchSnapshot();
  });

  it('opens popover', () => {
    const channel = MOCK_DATA.chime;
    const utils = render(
      <ServicesContext.Provider value={notificationServiceMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ChannelDetailsActions channel={channel} />
        </CoreServicesContext.Provider>
      </ServicesContext.Provider>
    );
    utils.getByText('Actions').click();
    expect(utils.container.firstChild).toMatchSnapshot();
  });

  it('clicks buttons in popover', async () => {
    const channel = MOCK_DATA.chime;
    const utils = render(
      <ServicesContext.Provider value={notificationServiceMock}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ChannelDetailsActions channel={channel} />
        </CoreServicesContext.Provider>
      </ServicesContext.Provider>
    );
    await act(async () => fireEvent.click(utils.getByText('Actions')));
    await waitFor(() => expect(utils.getByText('Edit')).toBeTruthy());
    await act(async () => fireEvent.click(utils.getByText('Edit')));
    await act(async () => fireEvent.click(utils.getByText('Actions')));
    await waitFor(() => expect(utils.getByText('Delete')).toBeTruthy());
    await act(async () => fireEvent.click(utils.getByText('Delete')));
    expect(utils.container.firstChild).toMatchSnapshot();
  });
});
