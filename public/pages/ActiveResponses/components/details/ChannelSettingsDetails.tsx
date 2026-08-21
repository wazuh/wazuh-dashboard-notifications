/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import _ from 'lodash';
import { EuiText } from '@elastic/eui';
import { ChannelItemType } from '../../../../../models/interfaces';
import { ListItemType } from '../../types';
import { ChannelDetailItems } from './ChannelDetailItems';
import { ACTIVE_RESPONSE_LOCATION_LABEL, ACTIVE_RESPONSE_TYPE_LABEL, ACTIVE_RESPONSE_TYPE_DESCRIPTION } from '../../../../../common/constants';

interface ChannelSettingsDetailsProps {
  channel: ChannelItemType | undefined;
}

export function ChannelSettingsDetails(props: ChannelSettingsDetailsProps) {
  if (!props.channel) return null;

  const settingsList: Array<ListItemType> = [
    {
        title: 'Executable',
        description: props.channel.active_response.executable,
    },
    {
        title: 'Extra arguments',
        description: props.channel.active_response.extra_args || '—',
    },
    {
        title: 'Type',
        description: (
            <>
                {_.get(ACTIVE_RESPONSE_TYPE_LABEL, props.channel.active_response.type, '—')}
                {_.get(ACTIVE_RESPONSE_TYPE_DESCRIPTION, props.channel.active_response.type) && (
                    <EuiText size="s" color="subdued">
                        <p className="ouiTextColor--subdued">
                            {_.get(ACTIVE_RESPONSE_TYPE_DESCRIPTION, props.channel.active_response.type)}
                        </p>
                    </EuiText>
                )}
            </>
        ),
    },
    ...(props.channel.active_response.type === 'stateful' ? [{
            title: 'Stateful timeout (seconds)',
            description: props.channel.active_response.stateful_timeout.toString(),
        }]
        : []),
    {
        title: 'Location',
        description: _.get(ACTIVE_RESPONSE_LOCATION_LABEL, props.channel.active_response.location, '—'),
    },
    ...(props.channel.active_response.location === 'defined-agent' ? [{
            title: 'Agent ID',
            description: props.channel.active_response.agent_id || '—',
        }]
        : []),
  ];

  return (
    <>
      <ChannelDetailItems listItems={settingsList} />
    </>
  );
}
