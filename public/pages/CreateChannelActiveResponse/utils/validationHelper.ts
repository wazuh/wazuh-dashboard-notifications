/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';

export const validateChannelName = (name: string) => {
  const errors = [];
  if (_.trim(name).length === 0) errors.push('Channel name cannot be empty.');
  return errors;
};

export const validateExecutableName = (name: string) => {
  const errors = [];
  if (_.trim(name).length === 0) errors.push('Executable name cannot be empty.');
  return errors;
};

export const validateAgentId = (agentId: string) => {
  const errors = [];
  if (_.trim(agentId).length === 0) errors.push('Agent ID cannot be empty.');
  if (!/^\d+$/.test(agentId)) errors.push('Agent ID must be a number.');
  return errors;
}

