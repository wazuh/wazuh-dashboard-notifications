/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { fireEvent, render } from '@testing-library/react';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { ActiveResponseSettings } from '../components/ActiveResponseSettings';
import { CreateChannelContext } from '../CreateChannel';

describe('<ChimeSettings /> spec', () => {
  configure({ adapter: new Adapter() });

  it('renders the component', () => {
    const utils = render(
      <CreateChannelContext.Provider
        value={{
          edit: false,
          inputErrors: { executable: [], extraArgs: [], agentId: [], statefulTimeout: [], location: [], type: []},
          setInputErrors: jest.fn(),
        }}
      >
        <ActiveResponseSettings
          attributes={{
            type: 'stateful',
            executable: 'test.exe',
            extraArgs: '--test',
            location: 'defined-agent',
            agentId: '001',
            statefulTimeout: 60,
          }}
          setAttribute={jest.fn()}
        />
      </CreateChannelContext.Provider>
    );
    expect(utils.container.firstChild).toMatchSnapshot();
  });

  it('renders the component with error', () => {
    const utils = render(
      <CreateChannelContext.Provider
        value={{
          edit: false,
          inputErrors: { executable: ['test error'], extraArgs: [], agentId: ['test error'], statefulTimeout: [], location: [], type: []},
          setInputErrors: jest.fn(),
        }}
      >
        <ActiveResponseSettings
          attributes={{
            type: 'stateful',
            executable: '',
            extraArgs: '--test',
            location: 'defined-agent',
            agentId: '',
            statefulTimeout: 60,
          }}
          setAttribute={jest.fn()}
        />
      </CreateChannelContext.Provider>
    );
    expect(utils.container.firstChild).toMatchSnapshot();
  });

  it('changes input', () => {
    const setInputErrors = jest.fn();
    const setAttribute = jest.fn();
    const utils = render(
      <CreateChannelContext.Provider
        value={{
          edit: false,
          inputErrors: { executable: [], extraArgs: [], agentId: [], statefulTimeout: [], location: [], type: []},
          setInputErrors: setInputErrors,
        }}
      >
        <ActiveResponseSettings
          attributes={{
            type: 'stateful',
            executable: 'test.exe',
            extraArgs: '--test',
            location: 'defined-agent',
            agentId: '001',
            statefulTimeout: 60,
          }}
          setAttribute={setAttribute}
        />
      </CreateChannelContext.Provider>
    );
    const input = utils.getByLabelText('Executable');
    fireEvent.change(input, { target: { value: 'newExecutable.exe' } });
    fireEvent.blur(input);
    expect(setAttribute).toBeCalledWith('executable', 'newExecutable.exe');
    expect(setInputErrors).toBeCalled();
  });
});
