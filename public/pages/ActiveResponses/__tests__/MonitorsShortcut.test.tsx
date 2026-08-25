/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { MonitorsShortcut } from '../components/MonitorsShortcut';
import { handleMonitorsLinkClick } from '../../../utils/helpers';

jest.mock('../../../utils/helpers', () => ({
  getMonitorsAppUrl: () => 'http://localhost/app/monitors#/monitors',
  handleMonitorsLinkClick: jest.fn(),
}));

describe('<MonitorsShortcut/> spec', () => {
  it('links the button to the Monitors app url', () => {
    const utils = render(<MonitorsShortcut />);
    const button = utils.getByTestId('monitors-shortcut-button');
    expect(button.getAttribute('href')).toBe(
      'http://localhost/app/monitors#/monitors'
    );
  });

  it('soft-navigates instead of a full reload when the button is clicked', () => {
    const utils = render(<MonitorsShortcut />);
    fireEvent.click(utils.getByTestId('monitors-shortcut-button'));
    expect(handleMonitorsLinkClick).toHaveBeenCalled();
  });
});
