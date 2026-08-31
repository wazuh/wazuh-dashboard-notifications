/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSmallButton, EuiContextMenuItem, EuiPopover } from '@elastic/eui';
import React, { useContext, useState } from 'react';
import { SERVER_DELAY } from '../../../../common';
import { ChannelItemType } from '../../../../models/interfaces';
import { CoreServicesContext } from '../../../components/coreServices';
import { ModalConsumer } from '../../../components/Modal';
import { ServicesContext } from '../../../services';
import { ROUTES } from '../../../utils/constants';
import { DeleteChannelModal } from './modals/DeleteChannelModal';
import { MuteChannelModal } from './modals/MuteChannelModal';

interface ChannelActionsParams {
  label: string;
  disabled: boolean;
  modal?: React.ReactNode;
  modalParams?: object;
  href?: string;
  action?: () => void;
}

interface ChannelActionsProps {
  selected: ChannelItemType[];
  setSelected: (items: ChannelItemType[]) => void;
  items: ChannelItemType[];
  setItems: (items: ChannelItemType[]) => void;
  refresh: () => void;
}

export function ChannelActions(props: ChannelActionsProps) {
  const coreContext = useContext(CoreServicesContext)!;
  const servicesContext = useContext(ServicesContext)!;
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const actions: ChannelActionsParams[] = [
    {
      label: 'Edit',
      disabled: props.selected.length !== 1,
      href: `#${ROUTES.EDIT_CHANNEL}/${props.selected[0]?.config_id}`,
    },
    {
      label: 'Delete',
      disabled: props.selected.length === 0,
      modal: DeleteChannelModal,
      modalParams: { refresh: props.refresh },
    },
    {
      label: 'Mute',
      disabled:
        props.selected.length === 0 ||
        !props.selected.every((channel) => channel.is_enabled),
      modal: MuteChannelModal,
      modalParams: { refresh: props.refresh, setSelected: props.setSelected },
    },
    {
      label: 'Unmute',
      disabled:
        props.selected.length === 0 ||
        props.selected.some((channel) => channel.is_enabled),
      action: async () => {
        const unmutedChannels = props.selected.map((channel) => ({
          ...channel,
          is_enabled: true,
        }));
        const results = await Promise.allSettled(
          unmutedChannels.map((channel) =>
            servicesContext.notificationService.updateConfig(
              channel.config_id,
              channel
            )
          )
        );
        const failedCount = results.filter(
          (result) => result.status === 'rejected'
        ).length;
        const num = props.selected.length;
        if (failedCount === 0) {
          coreContext.notifications.toasts.addSuccess(
            `${
              num >= 2
                ? num + ' channels'
                : 'Channel ' + unmutedChannels[0].name
            } successfully unmuted.`
          );
        } else {
          coreContext.notifications.toasts.addDanger(
            `Failed to unmute ${failedCount} of ${num} channel${
              num === 1 ? '' : 's'
            }.`
          );
        }
        props.setSelected(unmutedChannels);
        setTimeout(() => props.refresh(), SERVER_DELAY);
      },
    },
  ];

  return (
    <ModalConsumer>
      {({ onShow }) => (
        <EuiPopover
          panelPaddingSize="none"
          button={
            <EuiSmallButton
              iconType="arrowDown"
              iconSide="right"
              disabled={props.selected.length === 0}
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            >
              Actions
            </EuiSmallButton>
          }
          isOpen={isPopoverOpen}
          closePopover={() => setIsPopoverOpen(false)}
        >
          {actions.map((params) => (
            <EuiContextMenuItem
              key={params.label}
              disabled={params.disabled}
              size="s"
              onClick={() => {
                setIsPopoverOpen(false);
                if (params.modal) {
                  onShow(params.modal, {
                    selected: props.selected,
                    ...(params.modalParams || {}),
                  });
                }
                if (params.href) location.assign(params.href);
                if (params.action) params.action();
              }}
            >
              {params.label}
            </EuiContextMenuItem>
          ))}
        </EuiPopover>
      )}
    </ModalConsumer>
  );
}
