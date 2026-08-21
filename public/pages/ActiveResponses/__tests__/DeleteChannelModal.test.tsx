/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { MOCK_DATA } from '../../../../test/mocks/mockData';
import {
  coreServicesMock,
  notificationServiceMock,
} from '../../../../test/mocks/serviceMock';
import { CoreServicesContext } from '../../../components/coreServices';
import { DeleteChannelModal } from '../components/modals/DeleteChannelModal';

const mockGetMonitorsUsingDestination = jest.fn();
jest.mock('../../../services/AlertingMonitorsService', () =>
  jest.fn().mockImplementation(() => ({
    getMonitorsUsingDestination: mockGetMonitorsUsingDestination,
  }))
);

describe('<DeleteChannelModal /> spec', () => {
  beforeEach(() => {
    mockGetMonitorsUsingDestination.mockReset();
    mockGetMonitorsUsingDestination.mockRejectedValue(new Error('unavailable'));
  });

  it('shows the monitors callout with the referencing monitor count', async () => {
    mockGetMonitorsUsingDestination.mockResolvedValue([{ id: 'monitor-1', name: 'monitor-1' }]);
    const utils = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <DeleteChannelModal
          selected={[MOCK_DATA.chime]}
          onClose={() => {}}
          services={notificationServiceMock}
        />
      </CoreServicesContext.Provider>
    );

    await waitFor(() => {
      expect(utils.getByTestId('delete-channel-modal-monitors-callout').textContent).toContain(
        '1 Alerting monitor is still pointing at'
      );
    });
  });

  it('does not show the monitors callout when no monitors reference it', async () => {
    mockGetMonitorsUsingDestination.mockResolvedValue([]);
    const utils = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <DeleteChannelModal
          selected={[MOCK_DATA.chime]}
          onClose={() => {}}
          services={notificationServiceMock}
        />
      </CoreServicesContext.Provider>
    );

    await waitFor(() => {
      expect(utils.getByText('Delete')).toBeTruthy();
    });
    expect(utils.queryByTestId('delete-channel-modal-monitors-callout')).toBeNull();
  });
  it('returns if no channels', () => {
    const { container } = render(
      <DeleteChannelModal
        selected={[]}
        onClose={() => {}}
        services={notificationServiceMock}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the component', () => {
    const channels = [jest.fn() as any];
    const { container } = render(
      <DeleteChannelModal
        selected={channels}
        onClose={() => {}}
        services={notificationServiceMock}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders multiple channels', () => {
    const channels = [jest.fn() as any, jest.fn() as any];
    const { container } = render(
      <DeleteChannelModal
        selected={channels}
        onClose={() => {}}
        services={notificationServiceMock}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('deletes channels', () => {
    const channels = [jest.fn() as any, jest.fn() as any];
    const onClose = jest.fn();
    const notificationServiceMock = jest.fn() as any;
    notificationServiceMock.notificationService = {
      deleteConfigs: async (ids: string[]) => Promise.resolve(),
    };
    const utils = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <DeleteChannelModal
          selected={channels}
          onClose={onClose}
          services={notificationServiceMock}
        />
      </CoreServicesContext.Provider>
    );
    const input = utils.getByPlaceholderText('delete');
    fireEvent.change(input, { target: { value: 'delete' } });
    const deleteButton = utils.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(utils.container.firstChild).toMatchSnapshot();
  });

  it('handles failures when deleting channels', () => {
    const channels = [jest.fn() as any, jest.fn() as any];
    const onClose = jest.fn();
    const notificationServiceMock = jest.fn() as any;
    notificationServiceMock.notificationService = {
      deleteConfigs: async (ids: string[]) => Promise.reject(),
    };
    const utils = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <DeleteChannelModal
          selected={channels}
          onClose={onClose}
          services={notificationServiceMock}
        />
      </CoreServicesContext.Provider>
    );
    const input = utils.getByPlaceholderText('delete');
    fireEvent.change(input, { target: { value: 'delete' } });
    const deleteButton = utils.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(utils.container.firstChild).toMatchSnapshot();
  });
});
