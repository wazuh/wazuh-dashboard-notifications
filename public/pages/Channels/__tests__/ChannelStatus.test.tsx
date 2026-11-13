/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import {
  ChannelStatus,
  CHANNEL_MUTED_TOOLTIP,
} from '../components/ChannelStatus';

describe('<ChannelStatus/> spec', () => {
  it('shows an active channel', () => {
    const { getByText, queryByTestId } = render(
      <ChannelStatus isEnabled={true} />
    );

    expect(getByText('Active')).toBeTruthy();
    expect(queryByTestId('channel-muted')).toBeNull();
  });

  it('explains a muted channel with a tooltip', async () => {
    const { getByTestId, findByText } = render(
      <ChannelStatus isEnabled={false} />
    );
    const status = getByTestId('channel-muted');

    expect(status.textContent).toBe('Muted');
    // Reachable from the keyboard, not only on hover
    expect(status.getAttribute('tabindex')).toBe('0');

    fireEvent.mouseOver(status.parentElement!);
    expect(await findByText(CHANNEL_MUTED_TOOLTIP)).toBeTruthy();
  });
});
