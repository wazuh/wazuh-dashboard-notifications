/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import React, { useContext, useEffect, useState } from 'react';
import { SERVER_DELAY } from '../../../../../common';
import { ChannelItemType } from '../../../../../models/interfaces';
import { CoreServicesContext } from '../../../../components/coreServices';
import { ModalRootProps } from '../../../../components/Modal/ModalRoot';
import AlertingMonitorsService from '../../../../services/AlertingMonitorsService';

interface MuteChannelModalProps extends ModalRootProps {
  selected: ChannelItemType[];
  setSelected: (items: ChannelItemType[]) => void;
  refresh?: () => void;
  onClose: () => void;
}

export const MuteChannelModal = (props: MuteChannelModalProps) => {
  if (!props.selected.length) return null;

  const coreContext = useContext(CoreServicesContext)!;
  const [monitorCount, setMonitorCount] = useState<number>();
  const num = props.selected.length;
  const name = num >= 2 ? `${num} active responses` : props.selected[0].name;

  useEffect(() => {
    const alertingMonitorsService = new AlertingMonitorsService(
      props.services.notificationService.httpClient,
      props.services.notificationService.dataSourceId
    );
    Promise.all(
      props.selected.map((channel) =>
        alertingMonitorsService.getMonitorsUsingDestination(channel.config_id)
      )
    )
      .then((results) => {
        const uniqueMonitorIds = new Set(results.flat().map((monitor) => monitor.id));
        setMonitorCount(uniqueMonitorIds.size);
      })
      .catch(() => {
        // The alertingDashboards plugin may not be installed — leave the callout hidden.
      });
  }, []);

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
            {num >= 2 ? 'These active responses' : 'This active response'} will
            stop running {num >= 2 ? 'their commands' : 'its command'}.{' '}
            {num >= 2 ? 'They' : 'It'} will remain configured and can be
            unmuted at any time.
          </EuiText>
          {!!monitorCount && (
            <>
              <EuiSpacer />
              <EuiCallOut
                title="This affects Alerting monitors"
                color="warning"
                iconType="alert"
                data-test-subj="mute-channel-modal-monitors-callout"
              >
                <p>
                  {monitorCount} Alerting monitor{monitorCount === 1 ? '' : 's'}{' '}
                  {monitorCount === 1 ? 'is' : 'are'} still pointing at{' '}
                  {num >= 2 ? 'these active responses' : 'this active response'} and
                  will stop taking effect while{' '}
                  {num >= 2 ? 'they are' : 'it is'} muted.
                </p>
              </EuiCallOut>
            </>
          )}
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
                          ? num + ' active responses'
                          : 'Active response ' + props.selected[0].name
                      } successfully muted.`
                    );
                  } else {
                    coreContext.notifications.toasts.addDanger(
                      `Failed to mute ${failedCount} of ${num} active response${
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
