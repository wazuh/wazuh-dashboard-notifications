/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBasicTable,
  EuiSmallButton,
  EuiEmptyPrompt,
  EuiHealth,
  EuiHorizontalRule,
  EuiLink,
  EuiTableActionsColumnType,
  EuiTableFieldDataColumnType,
  EuiTableSortingType,
  EuiTitle,
  SortDirection,
  EuiText,
} from '@elastic/eui';
import { Criteria } from '@elastic/eui/src/components/basic_table/basic_table';
import { Pagination } from '@elastic/eui/src/components/basic_table/pagination_bar';
import _ from 'lodash';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SERVER_DELAY } from '../../../common';
import { ChannelItemType, TableState } from '../../../models/interfaces';
import {
  ContentPanel,
  ContentPanelActions,
} from '../../components/ContentPanel';
import { CoreServicesContext } from '../../components/coreServices';
import { ModalConsumer } from '../../components/Modal';
import { NotificationService } from '../../services';
import {
  ROUTES,
  setBreadcrumbsActiveResponse as setBreadcrumbs,
} from '../../utils/constants';
import {
  ACTIVE_RESPONSE_LOCATION_LABEL,
  ACTIVE_RESPONSE_TYPE_LABEL,
} from '../../../common/constants';
import { getErrorMessage } from '../../utils/helpers';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../Notifications/utils/constants';
import { ChannelActions } from './components/ChannelActions';
import { ChannelControls } from './components/ChannelControls';
import { DeleteChannelModal } from './components/modals/DeleteChannelModal';
import { MuteChannelModal } from './components/modals/MuteChannelModal';
import { MonitorsShortcut } from './components/MonitorsShortcut';
import { ChannelFiltersType } from './types';
import { DataSourceMenuProperties } from '../../services/DataSourceMenuContext';
import MDSEnabledComponent, {
  isDataSourceChanged,
  isDataSourceError,
} from '../../components/MDSEnabledComponent/MDSEnabledComponent';
import PageHeader from "../../components/PageHeader/PageHeader"
import { getUseUpdatedUx } from '../../services/utils/constants';
import { TopNavControlButtonData } from 'src/plugins/navigation/public';

interface ChannelsProps extends RouteComponentProps, DataSourceMenuProperties {
  notificationService: NotificationService;
}

interface ChannelsState extends TableState<ChannelItemType>, DataSourceMenuProperties {
  filters: ChannelFiltersType;
}

export class Channels extends MDSEnabledComponent<ChannelsProps, ChannelsState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<ChannelItemType>[];

  constructor(props: ChannelsProps) {
    super(props);
    const state: ChannelsState = {
      total: 0,
      from: 0,
      size: 10,
      search: '',
      filters: {},
      sortField: 'name',
      sortDirection: SortDirection.ASC,
      items: [],
      selectedItems: [],
      loading: true,
    };

    this.state = state;

    this.columns = [
      {
        field: 'name',
        name: 'Name',
        sortable: true,
        truncateText: true,
        render: (name: string, item: ChannelItemType) => (
          <EuiLink href={`#${ROUTES.ACTIVE_RESPONSE_DETAILS}/${item.config_id}`}>
            {name}
          </EuiLink>
        ),
      },
      {
        field: 'is_enabled',
        name: 'Status',
        sortable: true,
        width: '100px',
        render: (enabled: boolean) => {
          const color = enabled ? 'success' : 'subdued';
          const label = enabled ? 'Active' : 'Muted';
          return <EuiHealth color={color}>{label}</EuiHealth>;
        },
      },
      {
        field: 'active_response.location',
        name: 'Location',
        sortable: true,
        truncateText: false,
        render: (value: string) => _.get(ACTIVE_RESPONSE_LOCATION_LABEL, value, '-'),
      },
      {
        field: 'active_response.type',
        name: 'Type',
        sortable: true,
        truncateText: false,
        render: (value: string) => _.get(ACTIVE_RESPONSE_TYPE_LABEL, value, '-'),
      },
      {
        field: 'description',
        name: 'Description',
        sortable: true,
        truncateText: true,
        render: (description: string) => description || '-',
      },
    ];

    this.refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    setBreadcrumbs([]);
    window.scrollTo(0, 0);
    await this.refresh();
  }

  async componentDidUpdate(prevProps: ChannelsProps, prevState: ChannelsState) {
    const prevQuery = this.getQueryObjectFromState(prevState);
    const currQuery = this.getQueryObjectFromState(this.state);

    if (!_.isEqual(prevQuery, currQuery)) {
      await this.refresh();
    }
    if (isDataSourceChanged(this.props, prevProps)) {
      await this.refresh();
    }
  }

  getQueryObjectFromState(state: ChannelsState) {
    const queryObject: any = {
      from_index: state.from,
      max_items: state.size,
      query: state.search,
      config_type: 'active_response', // only get active response channels
      sort_field: state.sortField,
      sort_order: state.sortDirection,
    };
    if (state.filters.state != undefined)
      queryObject.is_enabled = state.filters.state;
    if (state.filters.type != undefined)
      queryObject['active_response.type'] = state.filters.type;
    if (state.filters.location != undefined)
      queryObject['active_response.location'] = state.filters.location;
    return queryObject;
  }

  async refresh() {
    this.setState({ loading: true });
    try {
      const queryObject = this.getQueryObjectFromState(this.state);
      const channels = await this.props.notificationService.getChannels(
        queryObject
      );
      this.setState({ items: channels.items, total: channels.total });
    } catch (error) {
      if (isDataSourceError(error)) {
        this.setState({ items: [], total: 0 });
      }
      this.context.notifications.toasts.addDanger(
        getErrorMessage(error, 'There was a problem loading active responses.')
      );
    }
    this.setState({ loading: false });
  }

  onTableChange = ({
    page: tablePage,
    sort,
  }: Criteria<ChannelItemType>): void => {
    const { index: page, size } = tablePage!;
    const { field: sortField, direction: sortDirection } = sort!;
    this.setState({ from: page * size, size, sortField, sortDirection });
  };

  onSelectionChange = (selectedItems: ChannelItemType[]): void => {
    this.setState({ selectedItems });
  };

  onSearchChange = (search: string): void => {
    this.setState({ from: 0, search });
  };

  onFiltersChange = (filters: ChannelFiltersType): void => {
    this.setState({ from: 0, filters });
  };

  unmuteChannel = async (item: ChannelItemType) => {
    const channel = { ...item, is_enabled: true };
    try {
      await this.props.notificationService.updateConfig(channel.config_id, channel);
      this.context.notifications.toasts.addSuccess(
        `Active response ${channel.name} successfully unmuted.`
      );
      setTimeout(() => this.refresh(), SERVER_DELAY);
    } catch (error) {
      this.context.notifications.toasts.addError(error?.body || error, {
        title: 'Failed to unmute active response',
      });
    }
  };

  render() {
    const filterIsApplied = !!this.state.search;
    const page = Math.floor(this.state.from / this.state.size);

    const hasActiveFilters =
      !!this.state.search ||
      this.state.filters.state !== undefined ||
      this.state.filters.type !== undefined ||
      this.state.filters.location !== undefined;
    const isTrulyEmpty = !this.state.loading && this.state.total === 0 && !hasActiveFilters;

    const pagination: Pagination = {
      pageIndex: page,
      pageSize: this.state.size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: this.state.total,
    };

    const sorting: EuiTableSortingType<ChannelItemType> = {
      sort: {
        direction: this.state.sortDirection,
        field: this.state.sortField,
      },
    };

    const selection = {
      selectable: () => true,
      onSelectionChange: this.onSelectionChange,
    };

    const headerControls = [
      {
        id: 'Create Channel',
        label: 'Create active response',
        iconType: 'plus',
        fill: true,
        href: `#${ROUTES.ACTIVE_RESPONSE_CREATE}`,
        testId: 'createButton',
        controlType: 'button',
      } as TopNavControlButtonData,
      {
        renderComponent: <MonitorsShortcut />,
      },
    ];

    const totalChannels = (
      <EuiTitle size="m">
        <h2>({this.state.total})</h2>
      </EuiTitle>
    )

    const channelActionsComponent = <ChannelActions
      selected={this.state.selectedItems}
      setSelected={(selectedItems: ChannelItemType[]) => this.setState({ selectedItems })}
      items={this.state.items}
      setItems={(items: ChannelItemType[]) => this.setState({ items })}
      refresh={this.refresh} />;

    const channelControlsComponent = <ChannelControls
      onSearchChange={this.onSearchChange}
      filters={this.state.filters}
      onFiltersChange={this.onFiltersChange} />;

    return (
      <ModalConsumer>
        {({ onShow }) => {
          const actionsColumn: EuiTableActionsColumnType<ChannelItemType> = {
            name: 'Actions',
            actions: [
              {
                name: 'Edit',
                description: 'Edit this active response',
                icon: 'pencil',
                type: 'icon',
                onClick: (item) =>
                  location.assign(`#${ROUTES.ACTIVE_RESPONSE_EDIT}/${item.config_id}`),
              },
              {
                name: 'Delete',
                description: 'Delete this active response',
                icon: 'trash',
                color: 'danger',
                type: 'icon',
                onClick: (item) =>
                  onShow(DeleteChannelModal, { selected: [item], refresh: this.refresh }),
              },
              {
                name: 'Mute',
                description: 'Mute this active response',
                icon: 'bellSlash',
                type: 'icon',
                available: (item) => item.is_enabled,
                onClick: (item) =>
                  onShow(MuteChannelModal, {
                    selected: [item],
                    setSelected: () => {},
                    refresh: this.refresh,
                  }),
              },
              {
                name: 'Unmute',
                description: 'Unmute this active response',
                icon: 'bell',
                type: 'icon',
                available: (item) => !item.is_enabled,
                onClick: (item) => this.unmuteChannel(item),
              },
            ],
          };

          const basicTableComponent = <EuiBasicTable
            columns={[...this.columns, actionsColumn]}
            items={this.state.items}
            itemId="config_id"
            isSelectable={true}
            selection={selection}
            noItemsMessage={<EuiEmptyPrompt
              title={<EuiText size="s"><h2>No active responses configured</h2></EuiText>}
              body={<EuiText size="s">Active responses are not configured. Create one to automatically react to security events.</EuiText>}
              actions={<EuiSmallButton href={`#${ROUTES.ACTIVE_RESPONSE_CREATE}`}>
                Create active response
              </EuiSmallButton>} />}
            onChange={this.onTableChange}
            pagination={pagination}
            sorting={sorting}
            tableLayout="auto"
            loading={this.state.loading} />;

          return (
            <>
              {getUseUpdatedUx() ? (
                <>
                  <PageHeader
                    appRightControls={headerControls}
                    appLeftControls={[{ renderComponent: totalChannels }]}
                  />
                  <ContentPanel panelStyles={{ padding: this.state.total < 1 ? '16px 16px 0px' : '16px' }}>
                    {!isTrulyEmpty && (
                      <>
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {channelControlsComponent}
                            <div style={{ marginLeft: '16px' }}>
                              {channelActionsComponent}
                            </div>
                          </div>
                        </div>
                        <EuiHorizontalRule margin="s" />
                      </>
                    )}
                    {basicTableComponent}
                  </ContentPanel>
                </>
              ) : (
                <ContentPanel
                  actions={
                    <ContentPanelActions
                      actions={[
                        ...(!isTrulyEmpty ? [{ component: channelActionsComponent }] : []),
                        {
                          component: (
                            <EuiSmallButton fill href={`#${ROUTES.ACTIVE_RESPONSE_CREATE}`}>
                              Create active response
                            </EuiSmallButton>
                          ),
                        },
                        {
                          component: <MonitorsShortcut />,
                        },
                      ]}
                    />
                  }
                  bodyStyles={{ padding: 'initial' }}
                  title="Active responses"
                  titleSize="s"
                  total={this.state.total}
                >
                  {!isTrulyEmpty && (
                    <>
                      {channelControlsComponent}
                      <EuiHorizontalRule margin="s" />
                    </>
                  )}
                  {basicTableComponent}
                </ContentPanel>
              )}
            </>
          );
        }}
      </ModalConsumer>
    );
  }
};

