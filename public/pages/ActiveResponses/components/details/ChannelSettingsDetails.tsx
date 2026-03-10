/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChannelItemType } from '../../../../../models/interfaces';
import { ListItemType } from '../../types';
import { ChannelDetailItems } from './ChannelDetailItems';

interface ChannelSettingsDetailsProps {
  channel: ChannelItemType | undefined;
}

export function ChannelSettingsDetails(props: ChannelSettingsDetailsProps) {
  if (!props.channel) return null;

  const settingsList: Array<ListItemType> = [
    {
        title: 'Executable name',
        description: props.channel.active_response.executable_name,
    },
    {
        title: 'Executable args',
        description: props.channel.active_response.executable_args,
    },
    {
        title: 'Active Response type',
        description: props.channel.active_response.type,
    },
    ...(props.channel.active_response.type === 'stateful' ? [{
            title: 'Active Response timeout (seconds)',
            description: props.channel.active_response.timeout.toString(),
        }]
        : []),
    {
        title: 'Active Response location',
        description: props.channel.active_response.location,
    },
    ...(props.channel.active_response.location === 'defined-agent' ? [{
            title: 'Agent ID',
            description: props.channel.active_response.agent_id || '-',
        }]
        : []),
  ];
  // const getModalComponent = (
  //   items: string[] | HeaderItemType[],
  //   header: string,
  //   title?: string,
  //   separator = ', ',
  //   isParameters?: boolean
  // ) => {
  //   return (
  //     <>
  //       <div style={{ whiteSpace: 'pre-line' }}>
  //         {items
  //           .slice(0, 5)
  //           .map((item: string | HeaderItemType) =>
  //             typeof item === 'string' ? item : `${item.key}: ${item.value}`
  //           )
  //           .join(separator) || '-'}
  //       </div>
  //       {items.length > 5 && (
  //         <>
  //           {' '}
  //           <ModalConsumer>
  //             {({ onShow }) => (
  //               <EuiLink
  //                 onClick={
  //                   typeof items[0] === 'string'
  //                     ? () =>
  //                         onShow(DetailsListModal, {
  //                           header: `${header} (${items.length})`,
  //                           title: title,
  //                           items: items,
  //                         })
  //                     : () =>
  //                         onShow(DetailsTableModal, {
  //                           header: `${header} (${items.length})`,
  //                           isParameters,
  //                           items: items,
  //                         })
  //                 }
  //               >
  //                 {items.length - 5} more
  //               </EuiLink>
  //             )}
  //           </ModalConsumer>
  //         </>
  //       )}
  //     </>
  //   );
  // };

  return (
    <>
      <ChannelDetailItems listItems={settingsList} />
    </>
  );
}
