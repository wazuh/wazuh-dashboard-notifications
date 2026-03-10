/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from '@testing-library/react';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { MOCK_DATA_ACTIVE_RESPONSE } from '../../../../test/mocks/mockData';
import { ChannelSettingsDetails } from '../components/details/ChannelSettingsDetails';

describe('<ChannelSettingsDetails /> spec', () => {
  configure({ adapter: new Adapter() });

  it('renders the empty component', () => {
    const utils = render(<ChannelSettingsDetails channel={undefined} />);
    expect(utils.container.firstChild).toMatchSnapshot();
  });

  it('renders Active Response channel', () => {
    const utils = render(
      <ChannelSettingsDetails channel={MOCK_DATA_ACTIVE_RESPONSE.channels.items[0]} />
    );
    expect(utils.container.firstChild).toMatchSnapshot();
  });
});
