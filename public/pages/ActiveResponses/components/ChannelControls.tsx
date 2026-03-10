/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiCompressedFieldSearch,
  EuiSmallFilterButton,
  EuiFilterGroup,
  EuiFilterSelectItem,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
} from '@elastic/eui';
import _ from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import {
  CHANNEL_TYPE,
} from '../../../../common/constants';
import { MainContext } from '../../MainActiveResponses/Main';
import { ChannelFiltersType } from '../types';

interface ChannelControlsProps {
  onSearchChange: (search: string) => void;
  filters: ChannelFiltersType;
  onFiltersChange: (filters: ChannelFiltersType) => void;
}

export const ChannelControls = (props: ChannelControlsProps) => {
  const mainStateContext = useContext(MainContext)!;
  const [isStatePopoverOpen, setIsStatePopoverOpen] = useState(false);
  const [stateItems, setStateItems] = useState([
    { field: 'true', display: 'Active', checked: 'off' },
    { field: 'false', display: 'Muted', checked: 'off' },
  ]);
  const [isTypePopoverOpen, setIsTypePopoverOpen] = useState(false);
  const [typeItems, setTypeItems] = useState(
    [
      {field: 'stateful', display: 'Stateful', checked: 'off'},
      {field: 'stateless', display: 'Stateless', checked: 'off'},
    ]
  );
  const [isLocationPopoverOpen, setIsLocationPopoverOpen] = useState(false);
  const [locationItems, setLocationItems] = useState(
    [
      {field: 'all', display: 'All', checked: 'off'},
      {field: 'defined-agent', display: 'Defined agent', checked: 'off'},
      {field: 'local', display: 'Local', checked: 'off'},
    ]
  );

  // useEffect(() => {
  //   const newItems = typeItems.filter(
  //     ({ field }) =>
  //       !!mainStateContext.availableChannels[field as keyof typeof CHANNEL_TYPE]
  //   );
  //   if (newItems.length !== typeItems.length) setTypeItems(newItems);
  // }, [mainStateContext.availableChannels]);

  function updateItem(
    items: Array<{ field: string; display: string; checked: string }>,
    index: number,
    type: 'state' | 'type' | 'location',
    singleSelect?: boolean
  ) {
    if (!items[index]) return;
    const newItems = [...items];
    if (singleSelect) {
      const checked = newItems[index].checked === 'off' ? 'on' : 'off';
      newItems.forEach((item, i) => (item.checked = 'off'));
      newItems[index].checked = checked;
    } else {
      newItems[index].checked =
        newItems[index].checked === 'off' ? 'on' : 'off';
    }

    const newFilters = _.clone(props.filters);
    console.log({ newFilters });
    const checkedItems = newItems
      .filter((item) => item.checked === 'on')
      .map((item) => item.field);

    switch (type) {
      case 'state':
        setStateItems(newItems);
        newFilters.state = checkedItems[0];
        break;
      case 'type':
        setTypeItems(newItems);
        newFilters.type = checkedItems[0];
        break;
      case 'location':
        setLocationItems(newItems);
        newFilters.location = checkedItems[0];
        break;
      default:
        break;
    }

    console.log({ newFilters }, 'APPLYING FILTERS');
    props.onFiltersChange(newFilters);
  }

  function isItemSelected(
    items: Array<{ field: string; display: string; checked: string }>
  ) {
    return items
      .map((item) => item.checked === 'on')
      .reduce((flag, curr) => flag || curr, false);
  }

  return (
    <EuiFlexGroup gutterSize={'m'}>
      <EuiFlexItem>
        <EuiCompressedFieldSearch
          fullWidth={true}
          placeholder="Search"
          onSearch={props.onSearchChange}
        />
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiFilterGroup>
          <EuiPopover
            button={
              <EuiSmallFilterButton
                iconType="arrowDown"
                grow={false}
                onClick={() => setIsStatePopoverOpen(!isStatePopoverOpen)}
              >
                {isItemSelected(stateItems) ? <b>Status</b> : 'Status'}
              </EuiSmallFilterButton>
            }
            isOpen={isStatePopoverOpen}
            closePopover={() => setIsStatePopoverOpen(false)}
            panelPaddingSize="none"
          >
            {stateItems.map((item, index) => {
              return (
                <EuiFilterSelectItem
                  key={`channel-state-filter-${index}`}
                  checked={item.checked === 'on' ? 'on' : undefined}
                  onClick={() => {
                    updateItem(stateItems, index, 'state', true);
                    setIsStatePopoverOpen(false);
                  }}
                >
                  {item.display}
                </EuiFilterSelectItem>
              );
            })}
          </EuiPopover>
        </EuiFilterGroup>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFilterGroup>
          <EuiPopover
            button={
              <EuiSmallFilterButton
                iconType="arrowDown"
                grow={false}
                onClick={() => setIsLocationPopoverOpen(!isLocationPopoverOpen)}
              >
                {isItemSelected(locationItems) ? <b>Location</b> : 'Location'}
              </EuiSmallFilterButton>
            }
            isOpen={isLocationPopoverOpen}
            closePopover={() => setIsLocationPopoverOpen(false)}
            panelPaddingSize="none"
          >
            {locationItems.map((item, index) => {
              return (
                <EuiFilterSelectItem
                  key={`active-response-location-filter-${index}`}
                  checked={item.checked === 'on' ? 'on' : undefined}
                  onClick={() => updateItem(locationItems, index, 'location', true)}
                >
                  {item.display}
                </EuiFilterSelectItem>
              );
            })}
          </EuiPopover>
        </EuiFilterGroup>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFilterGroup>
          <EuiPopover
            button={
              <EuiSmallFilterButton
                iconType="arrowDown"
                grow={false}
                onClick={() => setIsTypePopoverOpen(!isTypePopoverOpen)}
              >
                {isItemSelected(typeItems) ? <b>Type</b> : 'Type'}
              </EuiSmallFilterButton>
            }
            isOpen={isTypePopoverOpen}
            closePopover={() => setIsTypePopoverOpen(false)}
            panelPaddingSize="none"
          >
            {typeItems.map((item, index) => {
              return (
                <EuiFilterSelectItem
                  key={`active-response-type-filter-${index}`}
                  checked={item.checked === 'on' ? 'on' : undefined}
                  onClick={() => updateItem(typeItems, index, 'type', true)}
                >
                  {item.display}
                </EuiFilterSelectItem>
              );
            })}
          </EuiPopover>
        </EuiFilterGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
