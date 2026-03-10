/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  validateChannelName,
  validateExecutableName,
  validateAgentId
} from '../utils/validationHelper';

describe('test create channel validation helpers', () => {
  it('validates channel name', () => {
    const pass = validateChannelName('test channel');
    const fail = validateChannelName('');
    expect(pass).toHaveLength(0);
    expect(fail).toHaveLength(1);
  });

  it('validates executable name', () => {
    const pass = validateExecutableName('test.exe');
    const fail = validateExecutableName('');
    expect(pass).toHaveLength(0);
    expect(fail).toHaveLength(1);
  });

  it('validates agent id', () => {
    const pass = validateAgentId('001');
    const failEmpty = validateAgentId('');
    const failNonNumeric = validateAgentId('abc');
    expect(pass).toHaveLength(0);
    expect(failEmpty).toHaveLength(2);
    expect(failNonNumeric).toHaveLength(1);
  });
});
