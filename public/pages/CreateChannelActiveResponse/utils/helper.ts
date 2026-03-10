/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const constructActiveResponseObject = ({
  activeResponseType,
  executableName,
  executableArgs,
  location,
  agentId,
  timeout
}: {
  activeResponseType: string,
  executableName: string,
  executableArgs: string,
  location: string,
  agentId: string,
  timeout: number
}) => {
  return {
    type: activeResponseType,
    executable_name: executableName,
    executable_args: executableArgs,
    location,
    agent_id: location === 'defined-agent' ? agentId : null, // agentId is only required when location is defined-agent
    timeout: activeResponseType === 'stateful' ? timeout : null, // timeout is only required for stateful active response
  };
}
