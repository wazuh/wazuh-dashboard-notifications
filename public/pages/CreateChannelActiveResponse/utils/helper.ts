/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const constructActiveResponseObject = ({
  activeResponseType,
  executable,
  extraArgs,
  location,
  agentId,
  statefulTimeout,
}: {
  activeResponseType: string;
  executable: string;
  extraArgs: string;
  location: string;
  agentId: string;
  statefulTimeout: number;
}) => {
  const activeResponseObject: any = {
    type: activeResponseType,
    executable: executable,
    location,
  };

  if (location === 'defined-agent') {
    activeResponseObject.agent_id = agentId;
  }

  if (activeResponseType === 'stateful') {
    activeResponseObject.stateful_timeout = statefulTimeout;
  }

  if (extraArgs.trim() !== '') {
    activeResponseObject.extra_args = extraArgs;
  }

  return activeResponseObject;
};
