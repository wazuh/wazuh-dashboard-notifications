/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiCallOut,
  EuiCompressedFieldText,
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

interface DeleteChannelModalProps extends ModalRootProps {
  selected: ChannelItemType[];
  refresh?: () => void;
  href?: string;
  onClose: () => void;
}

export const DeleteChannelModal = (props: DeleteChannelModalProps) => {
  if (!props.selected.length) return null;

  const coreContext = useContext(CoreServicesContext)!;
  const [input, setInput] = useState('');
  const [monitorCount, setMonitorCount] = useState<number>();
  const num = props.selected.length;
  const name = num >= 2 ? `${num} active responses` : props.selected[0].name;
  const message = `Delete ${
    num >= 2 ? 'the following active responses' : name
  } permanently?`;

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
              <h2>{`Delete ${name}?`}</h2>
            </EuiText>
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiText size="s">{message}</EuiText>
          {!!monitorCount && (
            <>
              <EuiSpacer />
              <EuiCallOut
                title="This affects Alerting monitors"
                color="warning"
                iconType="alert"
                data-test-subj="delete-channel-modal-monitors-callout"
              >
                <p>
                  {monitorCount} Alerting monitor{monitorCount === 1 ? '' : 's'}{' '}
                  {monitorCount === 1 ? 'is' : 'are'} still pointing at{' '}
                  {num >= 2 ? 'these active responses' : 'this active response'} and
                  will become broken action{monitorCount === 1 ? '' : 's'} if you
                  continue.
                </p>
              </EuiCallOut>
            </>
          )}
          {num >= 2 && (
            <>
              <EuiSpacer />
              {props.selected.map((channel, i) => (
                <EuiText
                  key={`channel-list-item-${i}`}
                  style={{ marginLeft: 20 }}
                  size="s"
                >
                  <li>{channel.name}</li>
                </EuiText>
              ))}
            </>
          )}
          <EuiSpacer />
          <EuiText size="s">
            To confirm delete, type <i>delete</i> in the field.
          </EuiText>
          <EuiCompressedFieldText
            placeholder="delete"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </EuiModalBody>
        <EuiModalFooter>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiSmallButtonEmpty onClick={props.onClose}>Cancel</EuiSmallButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSmallButton
                fill
                data-test-subj="delete-channel-modal-delete-button"
                color="danger"
                onClick={async () => {
                  props.services.notificationService
                    .deleteConfigs(
                      props.selected.map((channel) => channel.config_id)
                    )
                    .then((resp) => {
                      coreContext.notifications.toasts.addSuccess(
                        `${
                          props.selected.length > 1
                            ? props.selected.length + ' active responses'
                            : 'Active response ' + props.selected[0].name
                        } successfully deleted.`
                      );
                      props.onClose();
                      if (props.href)
                        setTimeout(
                          () => (location.hash = props.href!),
                          SERVER_DELAY
                        );
                      else if (props.refresh)
                        setTimeout(() => props.refresh!(), SERVER_DELAY);
                    })
                    .catch((error) => {
                      coreContext.notifications.toasts.addError(error?.body || error, {
                        title: 'Failed to delete one or more active responses.',
                      });
                      props.onClose();
                    });
                }}
                disabled={input !== 'delete'}
              >
                Delete
              </EuiSmallButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};
