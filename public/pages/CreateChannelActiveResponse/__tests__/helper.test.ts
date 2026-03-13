/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelItemType } from '../../../../models/interfaces';
import {
  constructActiveResponseObject
} from '../utils/helper';

describe('constructs active response objects', () => {
  const activeResponseItem: ChannelItemType['active_response'] = {
    executable: 'test',
    extra_args: '--test',
    location: 'defined-agent',
    agent_id: '001',
    stateful_timeout: 60,
    type: 'stateful',
  };

  it('constructs active response objects', () => {
    // @ts-ignore
    const resultFromActiveResponse = constructActiveResponseObject({
      activeResponseType: 'stateful',
      executable: 'test',
      extraArgs: '--test',
      location: 'defined-agent',
      agentId: '001',
      statefulTimeout: 60
    });
    expect(resultFromActiveResponse).toEqual(activeResponseItem);

  });
});
