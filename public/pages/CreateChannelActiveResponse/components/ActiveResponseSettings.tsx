/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCompressedFieldNumber, EuiCompressedFieldText, EuiIconTip, EuiCompressedSuperSelect, EuiCompressedTextArea, EuiCompressedFormRow, EuiSpacer } from '@elastic/eui';
import React, { useContext } from 'react';
import { CreateChannelContext } from '../CreateChannel';
import { validateAgentId, validateExecutableName } from '../utils/validationHelper';

interface ActiveResponseSettingsProps {
  attributes: {
    activeResponseType: string;
    executableName: string;
    executableArgs: string;
    location: string;
    agentId: string;
    timeout: number
  };
  setAttribute: (attributeName: 'activeResponseType' | 'executableName' | 'executableArgs' | 'location' | 'agentId' | 'timeout', value: string | number) => void;
}

export function ActiveResponseSettings(props: ActiveResponseSettingsProps) {
  const context = useContext(CreateChannelContext)!;

  return (
    <>
        <EuiCompressedFormRow
            label="Executable name"
            style={{ maxWidth: '700px' }}
            error={context.inputErrors.executableName.join(' ')}
            isInvalid={context.inputErrors.executableName.length > 0}
        >
            <EuiCompressedFieldText
                fullWidth
                data-test-subj="create-channel-active-response-executable-name"
                placeholder="Executable name"
                value={props.attributes.executableName}
                onChange={(e) => props.setAttribute('executableName', e.target.value)}
                isInvalid={context.inputErrors.executableName.length > 0}
                onBlur={() => {
                    context.setInputErrors({
                        ...context.inputErrors,
                        executableName: validateExecutableName(props.attributes.executableName),
                    });
                }}
            />
        </EuiCompressedFormRow>
        <EuiCompressedFormRow
            label="Executable arguments"
            style={{ maxWidth: '700px' }}
            error={context.inputErrors.executableArgs.join(' ')}
            isInvalid={context.inputErrors.executableArgs.length > 0}
        >
            <EuiCompressedTextArea
                style={{ height: '4.1rem' }}
                fullWidth
                data-test-subj="create-channel-active-response-executable-args"
                placeholder="Executable arguments"
                value={props.attributes.executableArgs}
                onChange={(e) => props.setAttribute('executableArgs', e.target.value)}
            />
        </EuiCompressedFormRow>
        <EuiCompressedFormRow
            label="Type"
            labelAppend={
                <EuiIconTip
                    content="Stateless active responses are one-time actions without an event definition to revert or stop them. Stateful responses revert or stop their actions after a period of time."
                    position="right"
                />
            }
            style={{ maxWidth: '300px' }}
            error={context.inputErrors.activeResponseType.join(' ')}
            isInvalid={context.inputErrors.activeResponseType.length > 0}
        >
            <EuiCompressedSuperSelect
                data-test-subj="create-channel-active-response-type"
                options={[
                    { value: 'stateless', inputDisplay: 'Stateless' },
                    { value: 'stateful', inputDisplay: 'Stateful' },
                ]}
                valueOfSelected={props.attributes.activeResponseType}
                onChange={(value) => props.setAttribute('activeResponseType', value)}
            />
        </EuiCompressedFormRow>
        {
            props.attributes.activeResponseType === 'stateful' && (
                <EuiCompressedFormRow
                    label="Timeout (seconds)"
                    labelAppend={
                        <EuiIconTip
                            content="Specifies how long the active response action is effective, in seconds. After this time, the system will automatically revert stateful responses or stop stateless responses if they are still running."
                            position="right"
                        />
                    }
                    style={{ maxWidth: '300px' }}
                    error={context.inputErrors.timeout.join(' ')}
                    isInvalid={context.inputErrors.timeout.length > 0}

                >
                    <EuiCompressedFieldNumber
                        data-test-subj="create-channel-active-response-timeout"
                        placeholder="Timeout in seconds"
                        value={props.attributes.timeout}
                        onChange={(e) => props.setAttribute('timeout', Number(e.target.value))}
                        isInvalid={context.inputErrors.timeout.length > 0}
                        min={0}
                    />
                </EuiCompressedFormRow>
            )
        }
        <EuiCompressedFormRow
            label="Location"
            labelAppend={
                <EuiIconTip
                    content="Specifies where the command must execute. 'All' means the command will execute on all agents, 'Defined agent' means the command will execute on specific agents defined by the user, and 'Local' means the command will execute on the agent that triggered the event."
                    position="right"
                />
            }
            style={{ maxWidth: '300px' }}
            error={context.inputErrors.location.join(' ')}
            isInvalid={context.inputErrors.location.length > 0}
        >
            <EuiCompressedSuperSelect
                data-test-subj="create-channel-active-response-location"
                options={[
                    { value: 'all', inputDisplay: 'All' },
                    { value: 'defined-agent', inputDisplay: 'Defined agent' },
                    { value: 'local', inputDisplay: 'Local' },
                ]}
                valueOfSelected={props.attributes.location}
                onChange={(value) => props.setAttribute('location', value)}
            />
        </EuiCompressedFormRow>
        {
            props.attributes.location === 'defined-agent' && (
                <EuiCompressedFormRow
                    label="Agent ID"
                    labelAppend={
                        <EuiIconTip
                            content="Specifies the ID of the agent where the command will execute."
                            position="right"
                        />
                    }
                    style={{ maxWidth: '300px' }}
                    error={context.inputErrors.agentId.join(' ')}
                    isInvalid={context.inputErrors.agentId.length > 0}
                >
                    <EuiCompressedFieldText
                        fullWidth
                        data-test-subj="create-channel-active-response-agent-id"
                        placeholder="Agent ID"
                        value={props.attributes.agentId}
                        onChange={(e) => props.setAttribute('agentId', e.target.value)}
                        isInvalid={context.inputErrors.agentId.length > 0}
                        onBlur={() => {
                            context.setInputErrors({
                                ...context.inputErrors,
                                agentId: validateAgentId(props.attributes.agentId),
                            });
                        }}
                    />

                </EuiCompressedFormRow>

            )
        }
               
    </>
    
  );
}
