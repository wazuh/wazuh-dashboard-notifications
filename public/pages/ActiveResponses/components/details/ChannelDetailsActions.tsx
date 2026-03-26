/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiContextMenuItem,
  EuiPopover,
  EuiTextColor,
} from '@elastic/eui';
import { TextColor } from '@elastic/eui/src/components/text/text_color';
import React, { useState } from 'react';
import { ChannelItemType } from '../../../../../models/interfaces';
import { ModalConsumer } from '../../../../components/Modal';
import { ROUTES } from '../../../../utils/constants';
import { DeleteChannelModal } from '../modals/DeleteChannelModal';

interface ChannelDetailsActionsParams {
  label: string;
  disabled?: boolean;
  color?: TextColor;
  modal?: React.ReactNode;
  modalParams?: object;
  href?: string;
  action?: () => void;
}

interface ChannelDetailsActionsProps {
  channel: ChannelItemType;
}

export function ChannelDetailsActions(props: ChannelDetailsActionsProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const actions: ChannelDetailsActionsParams[] = [
    {
      label: 'Edit',
      href: `#${ROUTES.ACTIVE_RESPONSE_EDIT}/${props.channel.config_id}?from=details`,
    },
    {
      label: 'Delete',
      color: 'danger',
      modal: DeleteChannelModal,
      modalParams: {
        href: `#${ROUTES.ACTIVE_RESPONSES}`,
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
                    selected: [props.channel],
                    ...(params.modalParams || {}),
                  });
                }
                if (params.href) location.assign(params.href);
                if (params.action) params.action();
              }}
            >
              {params.color ? (
                <EuiTextColor color={params.color}>{params.label}</EuiTextColor>
              ) : (
                params.label
              )}
            </EuiContextMenuItem>
          ))}
        </EuiPopover>
      )}
    </ModalConsumer>
  );
}
