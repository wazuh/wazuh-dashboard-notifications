/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiText,
} from '@elastic/eui';
import React, { useContext } from 'react';
import { SERVER_DELAY } from '../../../../../common';
import { ChannelItemType } from '../../../../../models/interfaces';
import { CoreServicesContext } from '../../../../components/coreServices';
import { ModalRootProps } from '../../../../components/Modal/ModalRoot';

interface MuteChannelModalProps extends ModalRootProps {
  selected: ChannelItemType[];
  setSelected: (items: ChannelItemType[]) => void;
  refresh?: () => void;
  onClose: () => void;
}

export const MuteChannelModal = (props: MuteChannelModalProps) => {
  if (!props.selected.length) return null;

  const coreContext = useContext(CoreServicesContext)!;
  const num = props.selected.length;
  const name = num >= 2 ? `${num} channels` : props.selected[0].name;

  return (
    <EuiOverlayMask>
      <EuiModal onClose={props.onClose} maxWidth={500}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <EuiText size="s">
              <h2>{`Mute ${name}?`}</h2>
            </EuiText>
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiText size="s">
            {num >= 2 ? 'These channels' : 'This channel'} will stop sending
            notifications to {num >= 2 ? 'their' : 'its'} recipients. However,{' '}
            {num >= 2 ? 'they' : 'the channel'} will remain available for
            selection.
          </EuiText>
        </EuiModalBody>
        <EuiModalFooter>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiSmallButtonEmpty onClick={props.onClose}>Cancel</EuiSmallButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSmallButton
                fill
                data-test-subj="mute-channel-modal-mute-button"
                onClick={async () => {
                  const mutedChannels = props.selected.map((channel) => ({
                    ...channel,
                    is_enabled: false,
                  }));
                  const results = await Promise.allSettled(
                    mutedChannels.map((channel) =>
                      props.services.notificationService.updateConfig(
                        channel.config_id,
                        channel
                      )
                    )
                  );
                  const failedCount = results.filter(
                    (result) => result.status === 'rejected'
                  ).length;
                  if (failedCount === 0) {
                    coreContext.notifications.toasts.addSuccess(
                      `${
                        num >= 2
                          ? num + ' channels'
                          : 'Channel ' + props.selected[0].name
                      } successfully muted.`
                    );
                  } else {
                    coreContext.notifications.toasts.addDanger(
                      `Failed to mute ${failedCount} of ${num} channel${
                        num === 1 ? '' : 's'
                      }.`
                    );
                  }
                  props.setSelected(mutedChannels);
                  if (props.refresh)
                    setTimeout(() => props.refresh!(), SERVER_DELAY);
                  props.onClose();
                }}
              >
                Mute
              </EuiSmallButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};
