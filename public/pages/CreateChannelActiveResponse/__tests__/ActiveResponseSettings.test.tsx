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

  it('explains that extra arguments reach the script on STDIN, not as argv', () => {
    const utils = render(
      <CreateChannelContext.Provider
        value={{
          edit: false,
          inputErrors: {
            executable: [],
            extraArgs: [],
            agentId: [],
            statefulTimeout: [],
            location: [],
            type: [],
          },
          setInputErrors: jest.fn(),
        }}
      >
        <ActiveResponseSettings
          attributes={{
            type: 'stateless',
            executable: 'test.exe',
            extraArgs: '',
            location: 'local',
            agentId: '',
            statefulTimeout: 60,
          }}
          setAttribute={jest.fn()}
        />
      </CreateChannelContext.Provider>
    );
    const textArea = utils.getByTestId(
      'create-channel-active-response-extra-args'
    );
    const helpText = utils.container.querySelector(
      `#${textArea.getAttribute('aria-describedby')}`
    );
    expect(helpText?.textContent).toBe(
      'Sent to the script as text in wazuh.active_response.extra_arguments of the JSON message it reads on STDIN, not as command-line arguments.'
    );
    expect(helpText?.querySelector('code')?.textContent).toBe(
      'wazuh.active_response.extra_arguments'
    );
    expect(textArea.getAttribute('placeholder')).toBeNull();
    expect(utils.queryByText(/verbatim/)).toBeNull();
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
