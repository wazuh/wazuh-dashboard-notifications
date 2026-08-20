/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelItemType } from '../../../../models/interfaces';
import {
  constructActiveResponseObject,
  secondsToMinutesLabel,
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

describe('secondsToMinutesLabel', () => {
  it('returns a minutes label for whole minutes', () => {
    expect(secondsToMinutesLabel(180)).toBe('3 minutes');
  });

  it('uses singular minute for 60 seconds', () => {
    expect(secondsToMinutesLabel(60)).toBe('1 minute');
  });

  it('returns null when the value is not a whole number of minutes', () => {
    expect(secondsToMinutesLabel(30)).toBeNull();
    expect(secondsToMinutesLabel(90)).toBeNull();
  });

  it('returns null for invalid values', () => {
    expect(secondsToMinutesLabel(0)).toBeNull();
    expect(secondsToMinutesLabel(NaN)).toBeNull();
  });
});
