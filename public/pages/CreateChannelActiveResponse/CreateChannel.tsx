/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import queryString from 'query-string';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SERVER_DELAY } from '../../../common';
import { ContentPanel } from '../../components/ContentPanel';
import { CoreServicesContext } from '../../components/coreServices';
import { ServicesContext } from '../../services';
import {
  BREADCRUMBS,
  ROUTES,
  setBreadcrumbsActiveResponse as setBreadcrumbs
} from '../../utils/constants';
import { getErrorMessage } from '../../utils/helpers';
import { ChannelNamePanel } from './components/ChannelNamePanel';
import {
  constructActiveResponseObject,
} from './utils/helper';
import {
  validateAgentId,
  validateChannelName,
  validateExecutableName,
} from './utils/validationHelper';
import { getUseUpdatedUx } from '../../services/utils/constants';
import { ActiveResponseSettings } from './components/ActiveResponseSettings';
interface CreateChannelsProps extends RouteComponentProps<{ id?: string }> {
  edit?: boolean;
}

type InputErrorsType = { [key: string]: string[] };

const DEFAULT_TIMEOUT = 180;
const DEFAULT_ACTIVE_RESPONSE_TYPE = 'stateless';
export const CreateChannelContext = createContext<{
  edit?: boolean;
  inputErrors: InputErrorsType;
  setInputErrors: (errors: InputErrorsType) => void;
} | null>(null);

export function CreateChannel(props: CreateChannelsProps) {
  const coreContext = useContext(CoreServicesContext)!;
  const servicesContext = useContext(ServicesContext)!;
  const id = props.match.params.id;
  const prevURL =
    props.edit && queryString.parse(props.location.search).from === 'details'
      ? `#${ROUTES.CHANNEL_DETAILS}/${id}`
      : `#${ROUTES.CHANNELS}`;

  const [isEnabled, setIsEnabled] = useState(true); // should be true unless editing muted channel
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Wazuh active response specific states
  const [executableName, setExecutableName] = useState('');
  const [executableArgs, setExecutableArgs] = useState('');
  const [location, setLocation] = useState('all');
  const [agentId, setAgentId] = useState('');
  const [activeResponseType, setActiveResponseType] = useState<'stateless' | 'stateful'>(DEFAULT_ACTIVE_RESPONSE_TYPE);
  const [timeout, setTimeout] = useState(DEFAULT_TIMEOUT);

  const [inputErrors, setInputErrors] = useState<InputErrorsType>({
    name: [],
    executableName: [],
    executableArgs: [],
    location: [],
    agentId: [],
    activeResponseType: [],
    timeout: [],
  });

  // Initial load: fetch channel data and set up page
  useEffect(() => {
    window.scrollTo(0, 0);
    if (props.edit) {
      getChannel();
    }
  }, []);

  // Update breadcrumbs when name changes
  useEffect(() => {
    const { edit } = props;
    const breadcrumbs = [
    ];
    if (edit) {
      if (getUseUpdatedUx()) {
        breadcrumbs.push(BREADCRUMBS.ACTIVE_RESPONSE_EDIT_DETAILS(name))
      }
      breadcrumbs.push(BREADCRUMBS.ACTIVE_RESPONSE_EDIT)
    } else {
      breadcrumbs.push(BREADCRUMBS.ACTIVE_RESPONSE_CREATE)
    }
    setBreadcrumbs(breadcrumbs);
  }, [name, props.edit]);

  const getChannel = async () => {
    const id = props.match.params.id;
    if (typeof id !== 'string') return;

    try {
      const response = await servicesContext.notificationService
        .getChannel(id);
      setIsEnabled(response.is_enabled);
      setName(response.name);
      setDescription(response.description || '');
      
      // Active response specific fields
      setActiveResponseType(response.active_response?.type || 'stateless');
      setExecutableName(response.active_response?.executable_name || '');
      setExecutableArgs(response.active_response?.executable_args || '');
      setLocation(response.active_response?.location || '');
      setAgentId(response.active_response?.agent_id || '');
      setTimeout(response.active_response?.timeout);

    } catch (error) {
      coreContext.notifications.toasts.addDanger(
        getErrorMessage(error, 'There was a problem loading channel.')
      );
    }
  };

  const isInputValid = (): boolean => {
    const errors: InputErrorsType = {
      name: validateChannelName(name),
      executableName: validateExecutableName(executableName),
      executableArgs: [], // no validation for args since it can be any string
      location: [], // no validation since it's a select with fixed options
      agentId: validateAgentId(agentId),
      activeResponseType: [], // no validation since it's a select with fixed options
      timeout: [], // no validation since it's optional and has a default value
    };
    setInputErrors(errors);
    return !Object.values(errors).reduce(
      (errorFlag, error) => errorFlag || error.length > 0,
      false
    );
  };

  const createConfigObject = () => {
    const config: any = {
      name,
      description,
      config_type: 'active_response',
      is_enabled: isEnabled,
      active_response: constructActiveResponseObject({
        activeResponseType,
        executableName,
        executableArgs,
        location,
        agentId,
        timeout: timeout || DEFAULT_TIMEOUT,
      }),
    };

    return config;
  };

  const sendTestMessage = async () => {
    const config = createConfigObject();
    config.name = 'temp-' + config.name;
    let tempChannelId;
    try {
      tempChannelId = await servicesContext.notificationService
        .createConfig(config)
        .then((response) => {
          console.info(
            'Created temporary active response to test send message:',
            response
          );
          return response.config_id;
        })
        .catch((error) => {
          error.message =
            'Failed to create temporary active response for test message. ' +
            error.message;
          throw error;
        });

      await servicesContext.notificationService.sendTestMessage(
        tempChannelId,
      );
      coreContext.notifications.toasts.addSuccess(
        'Successfully sent a test message.'
      );
    } catch (error: any) {
      coreContext.notifications.toasts.addError(error?.body || error, {
        title: 'Failed to send the test message.',
        toastMessage: 'View error details and adjust the active response settings.',
      });
    } finally {
      if (tempChannelId) {
        servicesContext.notificationService
          .deleteConfigs([tempChannelId])
          .then((response) => {
            console.info('Deleted temporary active response:', response);
          })
          .catch((error) => {
            coreContext.notifications.toasts.addError(error?.body || error, {
              title: 'Failed to delete temporary active response for test message.',
            });
          });
      }
    }
  };

  return (
    <>
      <CreateChannelContext.Provider
        value={{ edit: props.edit, inputErrors, setInputErrors }}
      >
        {!getUseUpdatedUx() && (
          <>
            <EuiText size="s">
              <h1>{`${props.edit ? 'Edit' : 'Create'} active response`}</h1>
            </EuiText>
            <EuiSpacer />
          </>
        )}

        <ChannelNamePanel
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
        />

        <EuiSpacer />
        <ContentPanel
          bodyStyles={{ padding: 'initial' }}
          title="Configurations"
          titleSize="s"
        >
          <ActiveResponseSettings
            attributes={{
              activeResponseType,
              executableName,
              executableArgs,
              location,
              agentId,
              timeout: timeout,
            }}
            setAttribute={(name, value) => {
              name === 'executableName' && setExecutableName(value as string);
              name === 'executableArgs' && setExecutableArgs(value as string);
              name === 'activeResponseType' && setActiveResponseType(value as string);
              name === 'location' && setLocation(value as string);
              name === 'agentId' && setAgentId(value as string);
              name === 'timeout' && setTimeout(value as number);
            }}
          />
        </ContentPanel>

        <EuiSpacer />
        <EuiFlexGroup gutterSize="m" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiSmallButtonEmpty href={prevURL}>Cancel</EuiSmallButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSmallButton
              data-test-subj="create-channel-send-test-message-button"
              onClick={() => {
                if (!isInputValid()) {
                  coreContext.notifications.toasts.addDanger(
                    'Some fields are invalid. Fix all highlighted error(s) before continuing.'
                  );
                  return;
                }
                sendTestMessage();
              }}
            >
              Send test message
            </EuiSmallButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSmallButton
              fill
              data-test-subj="create-channel-create-button"
              isLoading={loading}
              onClick={async () => {
                if (!isInputValid()) {
                  coreContext.notifications.toasts.addDanger(
                    'Some fields are invalid. Fix all highlighted error(s) before continuing.'
                  );
                  return;
                }
                setLoading(true);
                const config = createConfigObject();
                const request = props.edit
                  ? servicesContext.notificationService.updateConfig(
                    id!,
                    config
                  )
                  : servicesContext.notificationService.createConfig(config);
                await request
                  .then((response) => {
                    coreContext.notifications.toasts.addSuccess(
                      `Active response ${name} successfully ${props.edit ? 'updated' : 'created'
                      }.`
                    );
                    setTimeout(() => (location.hash = prevURL), SERVER_DELAY);
                  })
                  .catch((error) => {
                    setLoading(false);
                    coreContext.notifications.toasts.addError(
                      error?.body || error,
                      {
                        title: `Failed to ${props.edit ? 'update' : 'create'
                          } active response.`,
                      }
                    );
                  });
              }}
            >
              {props.edit ? 'Save' : 'Create'}
            </EuiSmallButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </CreateChannelContext.Provider>
    </>
  );
}
