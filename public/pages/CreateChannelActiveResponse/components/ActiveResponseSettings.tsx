/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCompressedFieldNumber, EuiCompressedFieldText, EuiIconTip, EuiCompressedSuperSelect, EuiCompressedTextArea, EuiCompressedFormRow, EuiSpacer } from '@elastic/eui';
import React, { useContext } from 'react';
import { CreateChannelContext } from '../CreateChannel';
import { validateAgentId, validateExecutable } from '../utils/validationHelper';
import { ACTIVE_RESPONSE_LOCATION, ACTIVE_RESPONSE_LOCATION_LABEL, ACTIVE_RESPONSE_TYPE } from '../../../../common/constants';

interface ActiveResponseSettingsProps {
  attributes: {
    type: string;
    executable: string;
    extraArgs: string;
    location: string;
    agentId: string;
    timeout: number
  };
  setAttribute: (attributeName: 'type' | 'executable' | 'extraArgs' | 'location' | 'agentId' | 'statefulTimeout', value: string | number) => void;
}

export function ActiveResponseSettings(props: ActiveResponseSettingsProps) {
  const context = useContext(CreateChannelContext)!;

  return (
    <div
            style={{maxWidth: '700px'}}
        >
        <EuiCompressedFormRow
            label="Executable"
            error={context.inputErrors.executable.join(' ')}
            isInvalid={context.inputErrors.executable.length > 0}
            fullWidth
        >
            <EuiCompressedFieldText
                fullWidth
                data-test-subj="create-channel-active-response-executable-name"
                placeholder="Executable"
                value={props.attributes.executable}
                onChange={(e) => props.setAttribute('executable', e.target.value)}
                isInvalid={context.inputErrors.executable.length > 0}
                onBlur={() => {
                    context.setInputErrors({
                        ...context.inputErrors,
                        executable: validateExecutable(props.attributes.executable),
                    });
                }}
            />
        </EuiCompressedFormRow>
        <EuiCompressedFormRow
            label={
                <span>
                    Extra arguments - <i style={{ fontWeight: 'normal' }}>optional</i>
                </span>
            }
            error={context.inputErrors.extraArgs.join(' ')}
            isInvalid={context.inputErrors.extraArgs.length > 0}
            fullWidth
        >
            <EuiCompressedTextArea
                style={{ height: '4.1rem' }}
                fullWidth
                data-test-subj="create-channel-active-response-extra-args"
                placeholder="Extra arguments"
                value={props.attributes.extraArgs}
                onChange={(e) => props.setAttribute('extraArgs', e.target.value)}
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
            error={context.inputErrors.type.join(' ')}
            isInvalid={context.inputErrors.type.length > 0}
            fullWidth
        >
            <EuiCompressedSuperSelect
                data-test-subj="create-channel-active-response-type"
                options={[
                    { value: ACTIVE_RESPONSE_TYPE.STATELESS, inputDisplay: 'Stateless' },
                    { value: ACTIVE_RESPONSE_TYPE.STATEFUL, inputDisplay: 'Stateful' },
                ]}
                valueOfSelected={props.attributes.type}
                onChange={(value) => props.setAttribute('type', value)}
                fullWidth
            />
        </EuiCompressedFormRow>
        {
            props.attributes.type === ACTIVE_RESPONSE_TYPE.STATEFUL && (
                <EuiCompressedFormRow
                    label="Stateful timeout (seconds)"
                    labelAppend={
                        <EuiIconTip
                            content="Specifies how long the active response action is effective, in seconds. After this time, the system will automatically revert stateful active responses."
                            position="right"
                        />
                    }
                    
                    error={context.inputErrors.statefulTimeout.join(' ')}
                    isInvalid={context.inputErrors.statefulTimeout.length > 0}
                    fullWidth
                    
                >
                    <EuiCompressedFieldNumber
                        data-test-subj="create-channel-active-response-timeout"
                        placeholder="Timeout in seconds"
                        value={props.attributes.statefulTimeout}
                        onChange={(e) => props.setAttribute('statefulTimeout', Number(e.target.value))}
                        isInvalid={context.inputErrors.statefulTimeout.length > 0}
                        min={0}
                        fullWidth
                    />
                </EuiCompressedFormRow>
            )
        }
        <EuiCompressedFormRow
            label="Location"
            labelAppend={
                <EuiIconTip
                    content={`Specifies where the command must execute. '${ACTIVE_RESPONSE_LOCATION_LABEL[ACTIVE_RESPONSE_LOCATION.ALL]}' means the command will execute on all agents, '${ACTIVE_RESPONSE_LOCATION_LABEL[ACTIVE_RESPONSE_LOCATION.DEFINED_AGENT]}' means the command will execute on specific agents defined by the user, and '${ACTIVE_RESPONSE_LOCATION_LABEL[ACTIVE_RESPONSE_LOCATION.LOCAL]}' means the command will execute on the agent that triggered the event.`}
                    position="right"
                />
            }
            error={context.inputErrors.location.join(' ')}
            isInvalid={context.inputErrors.location.length > 0}
            fullWidth
        >
            <EuiCompressedSuperSelect
                data-test-subj="create-channel-active-response-location"
                options={[
                    { value: ACTIVE_RESPONSE_LOCATION.ALL, inputDisplay: ACTIVE_RESPONSE_LOCATION_LABEL[ACTIVE_RESPONSE_LOCATION.ALL] },
                    { value: ACTIVE_RESPONSE_LOCATION.DEFINED_AGENT, inputDisplay: ACTIVE_RESPONSE_LOCATION_LABEL[ACTIVE_RESPONSE_LOCATION.DEFINED_AGENT] },
                    { value: ACTIVE_RESPONSE_LOCATION.LOCAL, inputDisplay: ACTIVE_RESPONSE_LOCATION_LABEL[ACTIVE_RESPONSE_LOCATION.LOCAL] },
                ]}
                valueOfSelected={props.attributes.location}
                onChange={(value) => props.setAttribute('location', value)}
                fullWidth
            />
        </EuiCompressedFormRow>
        {
            props.attributes.location === ACTIVE_RESPONSE_LOCATION.DEFINED_AGENT && (
                <EuiCompressedFormRow
                    label="Agent ID"
                    labelAppend={
                        <EuiIconTip
                            content="Specifies the ID of the agent where the command will execute."
                            position="right"
                        />
                    }
                    error={context.inputErrors.agentId.join(' ')}
                    isInvalid={context.inputErrors.agentId.length > 0}
                    fullWidth
                >
                    <EuiCompressedFieldText
                        fullWidth
                        data-test-subj="create-channel-active-response-agent-id"
                        placeholder="Enter the agent ID"
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
    </div>
  );
}
