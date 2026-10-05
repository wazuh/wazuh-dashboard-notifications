/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';

export const validateChannelName = (name: string) => {
  const errors = [];
  if (_.trim(name).length === 0) errors.push('Active response name cannot be empty.');
  return errors;
};

export const validateExecutable = (name: string) => {
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

export const validateStatefulTimeout = (timeout: number) => {
  const errors = [];
  if (isNaN(timeout)) errors.push('Stateful timeout must be a number.');
  else if (timeout <= 0) errors.push('Stateful timeout must be greater than 0.');
  return errors;
}
