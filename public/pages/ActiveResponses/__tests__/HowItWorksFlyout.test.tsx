/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import {
  HOW_IT_WORKS_TITLE,
  HowItWorksFlyout,
  HowItWorksShortcut,
} from '../components/HowItWorksFlyout';
import { ACTIVE_RESPONSE_DOCUMENTATION_URL } from '../../../utils/constants';

describe('<HowItWorksFlyout/> spec', () => {
  it('renders the flyout', () => {
    const utils = render(<HowItWorksFlyout onClose={() => {}} />);
    expect(utils.getByText(HOW_IT_WORKS_TITLE)).toBeInTheDocument();
  });

  it('links to the active response documentation', () => {
    const utils = render(<HowItWorksFlyout onClose={() => {}} />);
    expect(
      utils.getByText('Read the full documentation').closest('a')
    ).toHaveAttribute('href', ACTIVE_RESPONSE_DOCUMENTATION_URL);
  });
});

describe('<HowItWorksShortcut/> spec', () => {
  it('keeps the flyout closed until the button is clicked', () => {
    const utils = render(<HowItWorksShortcut />);
    expect(utils.queryByText(HOW_IT_WORKS_TITLE)).toBeNull();

    fireEvent.click(utils.getByTestId('how-it-works-button'));
    expect(utils.getByText(HOW_IT_WORKS_TITLE)).toBeInTheDocument();
  });
});
