/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiHorizontalRule,
  EuiLink,
  EuiButtonIcon,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui';
import React, { useState } from 'react';
import {
  ACTIVE_RESPONSE_DEFAULT_STATEFUL_TIMEOUT,
  ACTIVE_RESPONSE_LOCATION,
  ACTIVE_RESPONSE_LOCATION_DESCRIPTION,
  ACTIVE_RESPONSE_LOCATION_LABEL,
  ACTIVE_RESPONSE_TYPE,
  ACTIVE_RESPONSE_TYPE_DESCRIPTION,
  ACTIVE_RESPONSE_TYPE_LABEL,
} from '../../../../common/constants';
import { ACTIVE_RESPONSE_DOCUMENTATION_URL } from '../../../utils/constants';

export const HOW_IT_WORKS_TITLE = 'How active responses work';

const STEPS = [
  'The Wazuh Engine detects a security event on a monitored endpoint.',
  'An Alerting monitor evaluates that event and one of its triggers fires.',
  'The trigger runs its action, which calls an active response by name.',
  'The Wazuh manager sends the command to the agents you targeted.',
  'On each agent, the wazuh-execd daemon runs the executable. A stateful response is reverted once its timeout expires.',
];

const SETTINGS = [
  {
    term: 'Name',
    detail: (
      <>
        Identifies the active response. Alerting monitor triggers reference it
        by this name, so keep it descriptive.
      </>
    ),
  },
  {
    term: 'Description',
    detail: <>Optional. What the response does and when it should run.</>,
  },
  {
    term: 'Executable',
    detail: (
      <>
        The script the agent runs. It must already exist on every targeted agent
        — the dashboard does not deploy it.
      </>
    ),
  },
  {
    term: 'Extra arguments',
    detail: <>Optional. Passed verbatim to the executable.</>,
  },
  {
    term: 'Type',
    detail: (
      <>
        <em>{ACTIVE_RESPONSE_TYPE_LABEL[ACTIVE_RESPONSE_TYPE.STATELESS]}</em>{' '}
        {ACTIVE_RESPONSE_TYPE_DESCRIPTION[ACTIVE_RESPONSE_TYPE.STATELESS]}{' '}
        <em>{ACTIVE_RESPONSE_TYPE_LABEL[ACTIVE_RESPONSE_TYPE.STATEFUL]}</em>{' '}
        {ACTIVE_RESPONSE_TYPE_DESCRIPTION[ACTIVE_RESPONSE_TYPE.STATEFUL]}
      </>
    ),
  },
  {
    term: 'Stateful timeout',
    detail: (
      <>
        Stateful responses only. How many seconds the agent waits before
        reverting the action. Default is{' '}
        {ACTIVE_RESPONSE_DEFAULT_STATEFUL_TIMEOUT}.
      </>
    ),
  },
  {
    term: 'Location',
    detail: (
      <>
        Which agents run the executable:{' '}
        <em>
          {ACTIVE_RESPONSE_LOCATION_LABEL[ACTIVE_RESPONSE_LOCATION.LOCAL]}
        </em>{' '}
        {ACTIVE_RESPONSE_LOCATION_DESCRIPTION[ACTIVE_RESPONSE_LOCATION.LOCAL]}{' '}
        <em>
          {
            ACTIVE_RESPONSE_LOCATION_LABEL[
            ACTIVE_RESPONSE_LOCATION.DEFINED_AGENT
            ]
          }
        </em>{' '}
        {
          ACTIVE_RESPONSE_LOCATION_DESCRIPTION[
          ACTIVE_RESPONSE_LOCATION.DEFINED_AGENT
          ]
        }{' '}
        <em>{ACTIVE_RESPONSE_LOCATION_LABEL[ACTIVE_RESPONSE_LOCATION.ALL]}</em>{' '}
        {ACTIVE_RESPONSE_LOCATION_DESCRIPTION[ACTIVE_RESPONSE_LOCATION.ALL]} Use
        it with caution.
      </>
    ),
  },
];

interface HowItWorksFlyoutProps {
  onClose: () => void;
}

/**
 * Explains what an active response is, how one reaches an agent and what each
 * setting of the create form means.
 */
export function HowItWorksFlyout(props: HowItWorksFlyoutProps) {
  return (
    <EuiFlyout
      onClose={props.onClose}
      size="s"
      ownFocus
      aria-labelledby="howItWorksFlyoutTitle"
      data-test-subj="how-it-works-flyout"
    >
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2 id="howItWorksFlyoutTitle">{HOW_IT_WORKS_TITLE}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiText size="s">
          <p>
            An active response automatically executes an action on your
            endpoints when a security event calls for one — blocking an IP
            address, disabling an account or running any script you provide.
          </p>
        </EuiText>

        <EuiSpacer size="l" />

        <EuiTitle size="xs">
          <h3>From event to action</h3>
        </EuiTitle>
        <EuiSpacer size="s" />
        <EuiText size="s">
          <ol>
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </EuiText>

        <EuiHorizontalRule margin="l" />

        <EuiTitle size="xs">
          <h3>What you configure</h3>
        </EuiTitle>
        <EuiSpacer size="s" />
        <EuiText size="s">
          {SETTINGS.map((setting) => (
            <p key={setting.term}>
              <strong>{setting.term}.</strong> {setting.detail}
            </p>
          ))}
        </EuiText>

        <EuiHorizontalRule margin="l" />

        <EuiTitle size="xs">
          <h3>Putting one to work</h3>
        </EuiTitle>
        <EuiSpacer size="s" />
        <EuiText size="s">
          <p>
            Select <strong>Create active response</strong> and fill in the form
            above. Creating it only defines the action — nothing runs until an
            Alerting monitor calls it. Open <strong>Manage monitors</strong> to
            add it as the action of a trigger.
          </p>
        </EuiText>

        <EuiHorizontalRule margin="l" />

        <EuiText size="s">
          <EuiLink
            href={ACTIVE_RESPONSE_DOCUMENTATION_URL}
            target="_blank"
            external
          >
            Read the full documentation
          </EuiLink>
        </EuiText>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}

/**
 * Call to action that opens the {@link HowItWorksFlyout}.
 */
export function HowItWorksShortcut() {
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  return (
    <>
      <EuiToolTip content={HOW_IT_WORKS_TITLE}>
        <EuiButtonIcon
          iconType="iInCircle"
          onClick={() => setIsFlyoutVisible(true)}
          data-test-subj="how-it-works-button"
          aria-label="How it works button"
          color="success"
        />
      </EuiToolTip>
      {isFlyoutVisible && (
        <HowItWorksFlyout onClose={() => setIsFlyoutVisible(false)} />
      )}
    </>
  );
}
