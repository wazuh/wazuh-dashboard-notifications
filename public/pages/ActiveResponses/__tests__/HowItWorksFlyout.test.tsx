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
    expect(utils.getByText(HOW_IT_WORKS_TITLE)).toBeTruthy();
  });

  it('explains that extra arguments reach the script on STDIN, not as argv', () => {
    const utils = render(<HowItWorksFlyout onClose={() => {}} />);
    const setting = utils.getByText('Extra arguments.').closest('p');
    expect(setting?.textContent).toBe(
      'Extra arguments. Optional. Sent to the script as text in wazuh.active_response.extra_arguments of the JSON message it reads on STDIN, not as command-line arguments.'
    );
    expect(
      utils.getByText('wazuh.active_response.extra_arguments').tagName
    ).toBe('CODE');
    expect(utils.queryByText(/verbatim/)).toBeNull();
  });

  it('links to the active response documentation', () => {
    const utils = render(<HowItWorksFlyout onClose={() => {}} />);
    expect(
      utils
        .getByText('Read the full documentation')
        .closest('a')
        ?.getAttribute('href')
    ).toBe(ACTIVE_RESPONSE_DOCUMENTATION_URL);
  });
});

describe('<HowItWorksShortcut/> spec', () => {
  it('keeps the flyout closed until the button is clicked', () => {
    const utils = render(<HowItWorksShortcut />);
    expect(utils.queryByText(HOW_IT_WORKS_TITLE)).toBeNull();

    fireEvent.click(utils.getByTestId('how-it-works-button'));
    expect(utils.getByText(HOW_IT_WORKS_TITLE)).toBeTruthy();
  });
});
