/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCallOut, EuiCompressedFieldNumber, EuiCompressedFieldText, EuiIconTip, EuiCompressedSuperSelect, EuiCompressedTextArea, EuiCompressedFormRow, EuiSpacer, EuiText } from '@elastic/eui';
import React, { useContext } from 'react';
import { CreateChannelContext } from '../CreateChannel';
import { validateAgentId, validateExecutable, validateStatefulTimeout } from '../utils/validationHelper';
import { secondsToMinutesLabel } from '../utils/helper';
import { ACTIVE_RESPONSE_DEFAULT_STATEFUL_TIMEOUT, ACTIVE_RESPONSE_LOCATION, ACTIVE_RESPONSE_LOCATION_LABEL, ACTIVE_RESPONSE_TYPE, ACTIVE_RESPONSE_TYPE_DESCRIPTION } from '../../../../common/constants';

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

const DEFAULT_TIMEOUT_MINUTES_LABEL = secondsToMinutesLabel(ACTIVE_RESPONSE_DEFAULT_STATEFUL_TIMEOUT);

export function ActiveResponseSettings(props: ActiveResponseSettingsProps) {
  const context = useContext(CreateChannelContext)!;

  return (
    <div
            style={{maxWidth: '700px'}}
        >
        <EuiCompressedFormRow
            id="executable"
            label="Executable"
            error={context.inputErrors.executable.join(' ')}
            isInvalid={context.inputErrors.executable.length > 0}
            fullWidth
            helpText="The script must already exist on the target agent."
        >
            <EuiCompressedFieldText
                fullWidth
                data-test-subj="create-channel-active-response-executable-name"
                placeholder="e.g. block-ip"
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
            id="extraArgs"
            label={
                <span>
                    Extra arguments - <i style={{ fontWeight: 'normal' }}>optional</i>
                </span>
            }
            error={context.inputErrors.extraArgs.join(' ')}
            isInvalid={context.inputErrors.extraArgs.length > 0}
            fullWidth
            helpText="Passed verbatim to the executable."
        >
            <EuiCompressedTextArea
                style={{ height: '4.1rem' }}
                fullWidth
                data-test-subj="create-channel-active-response-extra-args"
                placeholder="e.g. --verbose"
                value={props.attributes.extraArgs}
                onChange={(e) => props.setAttribute('extraArgs', e.target.value)}
            />
        </EuiCompressedFormRow>
        
        <EuiCompressedFormRow
            id="type"
            label="Type"
            error={context.inputErrors.type.join(' ')}
            isInvalid={context.inputErrors.type.length > 0}
            fullWidth
        >
            <EuiCompressedSuperSelect
                data-test-subj="create-channel-active-response-type"
                options={[
                    {
                        value: ACTIVE_RESPONSE_TYPE.STATELESS,
                        inputDisplay: 'Stateless',
                        dropdownDisplay: (
                            <>
                                <strong>Stateless</strong>
                                <EuiText size="s" color="subdued">
                                    <p>
                                        {ACTIVE_RESPONSE_TYPE_DESCRIPTION[ACTIVE_RESPONSE_TYPE.STATELESS]}
                                    </p>
                                </EuiText>
                            </>
                        ),
                    },
                    {
                        value: ACTIVE_RESPONSE_TYPE.STATEFUL,
                        inputDisplay: 'Stateful',
                        dropdownDisplay: (
                            <>
                                <strong>Stateful</strong>
                                <EuiText size="s" color="subdued">
                                    <p>
                                        {ACTIVE_RESPONSE_TYPE_DESCRIPTION[ACTIVE_RESPONSE_TYPE.STATEFUL]}
                                    </p>
                                </EuiText>
                            </>
                        ),
                    },
                ]}
                valueOfSelected={props.attributes.type}
                onChange={(value) => props.setAttribute('type', value)}
                itemLayoutAlign="top"
                hasDividers
                fullWidth
            />
        </EuiCompressedFormRow>
        {
            props.attributes.type === ACTIVE_RESPONSE_TYPE.STATEFUL && (
                <EuiCompressedFormRow
                    id="statefulTimeout"
                    label="Stateful timeout"
                    helpText={`The agent reverts the action after ${props.attributes.statefulTimeout} second${props.attributes.statefulTimeout === 1 ? '' : 's'}. Default is ${ACTIVE_RESPONSE_DEFAULT_STATEFUL_TIMEOUT}${DEFAULT_TIMEOUT_MINUTES_LABEL ? ` (${DEFAULT_TIMEOUT_MINUTES_LABEL})` : ''}.`}
                    error={context.inputErrors.statefulTimeout.join(' ')}
                    isInvalid={context.inputErrors.statefulTimeout.length > 0}
                    fullWidth

                >
                    <EuiCompressedFieldNumber
                        data-test-subj="create-channel-active-response-timeout"
                        placeholder="Timeout in seconds"
                        value={props.attributes.statefulTimeout}
                        onChange={(e) => props.setAttribute('statefulTimeout', Number(e.target.value))}
                        onBlur={() => {
                            context.setInputErrors({
                                ...context.inputErrors,
                                statefulTimeout: validateStatefulTimeout(props.attributes.statefulTimeout),
                            });
                        }}
                        isInvalid={context.inputErrors.statefulTimeout.length > 0}
                        append="seconds"
                        min={1}
                        fullWidth
                    />
                </EuiCompressedFormRow>
            )
        }
        <EuiCompressedFormRow
            id="location"
            label="Location"
            error={context.inputErrors.location.join(' ')}
            isInvalid={context.inputErrors.location.length > 0}
            fullWidth
        >
            <EuiCompressedSuperSelect
                data-test-subj="create-channel-active-response-location"
                options={[
                    {
                        value: ACTIVE_RESPONSE_LOCATION.LOCAL,
                        inputDisplay: ACTIVE_RESPONSE_LOCATION_LABEL[ACTIVE_RESPONSE_LOCATION.LOCAL],
                        dropdownDisplay: (
                            <>
                                <strong>{ACTIVE_RESPONSE_LOCATION_LABEL[ACTIVE_RESPONSE_LOCATION.LOCAL]}</strong>
                                <EuiText size="s" color="subdued">
                                    <p className="ouiTextColor--subdued">
                                        The agent that reported the event. The safe default for most remediations.
                                    </p>
                                </EuiText>
                            </>
                        ),
                    },
                    {
                        value: ACTIVE_RESPONSE_LOCATION.DEFINED_AGENT,
                        inputDisplay: ACTIVE_RESPONSE_LOCATION_LABEL[ACTIVE_RESPONSE_LOCATION.DEFINED_AGENT],
                        dropdownDisplay: (
                            <>
                                <strong>{ACTIVE_RESPONSE_LOCATION_LABEL[ACTIVE_RESPONSE_LOCATION.DEFINED_AGENT]}</strong>
                                <EuiText size="s" color="subdued">
                                    <p className="ouiTextColor--subdued">
                                        One named agent, whatever reported the event.
                                    </p>
                                </EuiText>
                            </>
                        ),
                    },
                    {
                        value: ACTIVE_RESPONSE_LOCATION.ALL,
                        inputDisplay: ACTIVE_RESPONSE_LOCATION_LABEL[ACTIVE_RESPONSE_LOCATION.ALL],
                        dropdownDisplay: (
                            <>
                                <strong>{ACTIVE_RESPONSE_LOCATION_LABEL[ACTIVE_RESPONSE_LOCATION.ALL]}</strong>
                                <EuiText size="s" color="subdued">
                                    <p className="ouiTextColor--subdued">
                                        Every agent in the environment.
                                    </p>
                                </EuiText>
                            </>
                        ),
                    },
                ]}
                valueOfSelected={props.attributes.location}
                onChange={(value) => props.setAttribute('location', value)}
                itemLayoutAlign="top"
                hasDividers
                fullWidth
            />
        </EuiCompressedFormRow>
        {
            props.attributes.location === ACTIVE_RESPONSE_LOCATION.ALL && (
                <>
                    <EuiSpacer size="s" />
                    <EuiCallOut
                        title="This will run on every agent in your environment"
                        color="warning"
                        iconType="alert"
                        style={{ maxWidth: 700 }}
                    >
                        <p>
                            Fleet-wide responses are rarely intended. If the goal is to act on the machine that raised the alert, choose <strong>Local</strong>. Ask an administrator to validate the executable in a non-production environment first.
                        </p>
                    </EuiCallOut>
                </>
            )
        }
        {
            props.attributes.location === ACTIVE_RESPONSE_LOCATION.DEFINED_AGENT && (
                <EuiCompressedFormRow
                    id="agentId"
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
