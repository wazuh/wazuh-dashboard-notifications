/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHealth,
  EuiLink,
  EuiSmallButton,
  EuiSpacer,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { Toast } from '@elastic/eui/src/components/toast/global_toast_list';
import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ChannelItemType } from '../../../../../models/interfaces';
import { ContentPanel } from '../../../../components/ContentPanel';
import { CoreServicesContext } from '../../../../components/coreServices';
import { ModalConsumer } from '../../../../components/Modal';
import { ServicesContext } from '../../../../services';
import {
  BREADCRUMBS,
  ROUTES,
  setBreadcrumbsActiveResponse as setBreadcrumbs,
} from '../../../../utils/constants';
import {
  getActiveResponseExecutionsUrl,
  getMonitorDetailsUrl,
  handleActiveResponseExecutionsLinkClick,
  handleMonitorDetailsLinkClick,
  renderTime,
} from '../../../../utils/helpers';
import { ListItemType } from '../../types';
import { MuteChannelModal } from '../modals/MuteChannelModal';
import { ChannelDetailItems } from './ChannelDetailItems';
import { ChannelDetailsActions } from './ChannelDetailsActions';
import { ChannelSettingsDetails } from './ChannelSettingsDetails';
import AlertingMonitorsService, {
  AlertingMonitorSummary,
} from '../../../../services/AlertingMonitorsService';
import PageHeader from '../../../../components/PageHeader/PageHeader';
import { TopNavControlButtonData } from '../../../../../../../src/plugins/navigation/public';
import { getUseUpdatedUx } from '../../../../services/utils/constants';

interface ChannelDetailsProps
  extends RouteComponentProps<{
    id: string;
  }> {}

export function ChannelDetails(props: ChannelDetailsProps) {
  const coreContext = useContext(CoreServicesContext)!;
  const servicesContext = useContext(ServicesContext)!;
  const id = props.match.params.id;
  const [channel, setChannel] = useState<ChannelItemType>();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [usedByMonitors, setUsedByMonitors] = useState<
    AlertingMonitorSummary[]
  >([]);

  const sendTestMessage = async () => {
    try {
      await servicesContext.notificationService.sendTestMessage(id);
      coreContext.notifications.toasts.addSuccess(
        'Successfully sent a test message.'
      );
    } catch (error) {
      coreContext.notifications.toasts.addError(error?.body || error, {
        title: 'Failed to send the test message.',
        toastMessage:
          'View error details and adjust the active response settings.',
      });
    }
  };

  useEffect(() => {
    // setBreadcrumbs([
    //   BREADCRUMBS.ACTIVE_RESPONSES,
    // ]);
    refresh();
  }, []);

  useEffect(() => {
    if (!channel) return;
    const alertingMonitorsService = new AlertingMonitorsService(
      servicesContext.notificationService.httpClient,
      servicesContext.notificationService.dataSourceId
    );
    alertingMonitorsService
      .getMonitorsUsingDestination(channel.config_id)
      .then(setUsedByMonitors)
      .catch(() => {
        // The alertingDashboards plugin may not be installed, or the lookup failed —
        // fall back to the same "—" empty state the panel already shows.
      });
  }, [channel?.config_id]);

  const refresh = async () => {
    servicesContext.notificationService
      .getChannel(id)
      .then(async (response) => {
        if (response.config_type === 'email') {
          const channel =
            await servicesContext.notificationService.getEmailConfigDetails(
              response
            );
          if (channel.email?.invalid_ids?.length) {
            coreContext.notifications.toasts.addDanger(
              'The sender and/or some recipient groups might have been deleted.'
            );
          }
          return channel;
        }
        return response;
      })
      .then((response) => {
        setChannel(response);
        setBreadcrumbs([
          {
            text: response?.name || '',
            href: `${BREADCRUMBS.CHANNEL_DETAILS.href}/${id}`,
          },
        ]);
      })
      .catch((error) => {
        const newToast: Toast = {
          id: 'active-response-not-found-toast',
          title: 'Channel not found',
          color: 'danger',
          iconType: 'alert',
          text: (
            <>
              <EuiText
                size="s"
                style={{
                  fontWeight: 400,
                  color: 'rgb(52, 55, 65)',
                  marginTop: 10,
                  marginBottom: 20,
                }}
              >
                The active response might have been deleted.
              </EuiText>
              <EuiFlexGroup justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <EuiButton size="s" href={`#${ROUTES.ACTIVE_RESPONSES}`}>
                    View Active Responses dashboard
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </>
          ),
        };
        setToasts([...toasts, newToast]);
      });
  };

  const nameList: Array<ListItemType> = [
    {
      title: 'Active Response name',
      description: channel?.name || '—',
    },
    {
      title: 'Description',
      description: channel?.description || '—',
    },
    {
      title: 'Last updated',
      description: renderTime(channel?.last_updated_time_ms || NaN),
    },
  ];

  const usedByList: Array<ListItemType> = [
    {
      title: 'Alerting monitors',
      description:
        usedByMonitors.length === 0 ? (
          '—'
        ) : (
          <>
            {usedByMonitors.length} (
            {usedByMonitors.map((monitor, index) => (
              <React.Fragment key={monitor.id || monitor.name}>
                {index > 0 && ', '}
                <EuiLink
                  href={getMonitorDetailsUrl(monitor.id)}
                  onClick={(event) =>
                    handleMonitorDetailsLinkClick(event, monitor.id)
                  }
                  data-test-subj={`channel-details-used-by-monitor-link-${monitor.id}`}
                >
                  {monitor.name}
                </EuiLink>
              </React.Fragment>
            ))}
            )
          </>
        ),
    },
  ];

  const executionsUrl = channel
    ? getActiveResponseExecutionsUrl(channel.name)
    : '';

  const actionsAndMuteComponent = (
    <EuiFlexGroup gutterSize="s" alignItems="center">
      <EuiFlexItem />
      <EuiFlexItem grow={false}>
        {channel && executionsUrl && (
          <EuiToolTip content="Matches executions by name — if this active response was renamed, executions recorded under its previous name won't appear.">
            <EuiSmallButton
              iconType="popout"
              iconSide="right"
              href={executionsUrl}
              onClick={(event) =>
                handleActiveResponseExecutionsLinkClick(event, channel.name)
              }
              data-test-subj="channel-details-view-executions-button"
            >
              View recent executions
            </EuiSmallButton>
          </EuiToolTip>
        )}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        {channel && <ChannelDetailsActions channel={channel} />}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        {channel && (
          <ModalConsumer>
            {({ onShow }) => (
              <EuiSmallButton
                data-test-subj="channel-details-mute-button"
                iconType={channel.is_enabled ? 'bellSlash' : 'bell'}
                onClick={() => {
                  if (channel.is_enabled) {
                    onShow(MuteChannelModal, {
                      selected: [channel],
                      setSelected: (selected: any[]) => setChannel(selected[0]),
                    });
                  } else {
                    const newChannel = { ...channel, is_enabled: true };
                    servicesContext.notificationService
                      .updateConfig(channel.config_id, newChannel)
                      .then(() => {
                        coreContext.notifications.toasts.addSuccess(
                          `Active response ${channel.name} successfully unmuted.`
                        );
                        setChannel(newChannel);
                      });
                  }
                }}
              >
                {channel.is_enabled
                  ? 'Mute active response'
                  : 'Unmute active response'}
              </EuiSmallButton>
            )}
          </ModalConsumer>
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
  const rightControls = [
    {
      renderComponent: actionsAndMuteComponent,
    },
    {
      controlType: 'button',
      testId: 'send-test-message-button',
      isDisabled: !channel?.is_enabled,
      run: sendTestMessage,
      label: 'Send test message',
      fill: true,
    } as TopNavControlButtonData,
  ];

  const badgeComponent = (
    <EuiFlexItem grow={false} style={{ paddingTop: '5px' }}>
      {channel?.is_enabled === undefined ? null : channel.is_enabled ? (
        <EuiHealth color="success">Active</EuiHealth>
      ) : (
        <EuiHealth color="subdued">Muted</EuiHealth>
      )}
    </EuiFlexItem>
  );

  const badgeControls = [
    {
      renderComponent: badgeComponent,
    },
  ];

  return (
    <>
      <PageHeader
        appRightControls={rightControls}
        appBadgeControls={badgeControls}
      >
        {
          <EuiFlexGroup
            alignItems="center"
            gutterSize="m"
            style={{ padding: '0px 8px 0px 0px' }}
          >
            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="m" alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiText size="s">
                    <h1>{channel?.name ?? '-'}</h1>
                  </EuiText>
                </EuiFlexItem>
                {badgeComponent}
              </EuiFlexGroup>
            </EuiFlexItem>
            {actionsAndMuteComponent}
          </EuiFlexGroup>
        }
      </PageHeader>

      {!getUseUpdatedUx() && <EuiSpacer />}

      <ContentPanel
        bodyStyles={{ padding: 'initial' }}
        title="Name and description"
        titleSize="s"
      >
        <ChannelDetailItems listItems={nameList} />
      </ContentPanel>

      <EuiSpacer />

      <ContentPanel
        bodyStyles={{ padding: 'initial' }}
        title="Configurations"
        titleSize="s"
      >
        <ChannelSettingsDetails channel={channel} />
      </ContentPanel>

      <EuiSpacer />

      <ContentPanel
        bodyStyles={{ padding: 'initial' }}
        title="Used by"
        titleSize="s"
      >
        <ChannelDetailItems listItems={usedByList} />
      </ContentPanel>
    </>
  );
}
