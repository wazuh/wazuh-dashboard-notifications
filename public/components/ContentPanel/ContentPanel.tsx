/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import React from 'react';

interface ContentPanelProps {
  title?: string;
  titleSize?: 'xs' | 's' | 'm';
  total?: number;
  description?: string;
  bodyStyles?: object;
  panelStyles?: object;
  horizontalRuleClassName?: string;
  actions?: React.ReactNode | React.ReactNode[];
  children: React.ReactNode | React.ReactNode[];
}

const ContentPanel: React.SFC<ContentPanelProps> = ({
  title = '',
  titleSize = 's',
  total = undefined,
  description,
  bodyStyles = {},
  panelStyles = {},
  horizontalRuleClassName = '',
  actions,
  children,
}) => (
  <EuiPanel style={{ ...panelStyles }}>
    <EuiFlexGroup
      style={{ padding: '0px 0px' }}
      justifyContent="spaceBetween"
      alignItems="center"
    >
      <EuiFlexItem>
        <EuiTitle size={titleSize}>
          <h2>
            {title}
            {total !== undefined ? (
              <span
                style={{ color: '#9f9f9f', fontWeight: 300 }}
              >{` (${total})`}</span>
            ) : null}
          </h2>
        </EuiTitle>
        {description && (
          <>
            <EuiSpacer size="xs" />
            <EuiText size="s" color="subdued">
              <p>{description}</p>
            </EuiText>
          </>
        )}
      </EuiFlexItem>
      {actions ? (
        <EuiFlexItem grow={false}>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            {Array.isArray(actions) ? (
              (actions as React.ReactNode[]).map(
                (action: React.ReactNode, idx: number): React.ReactNode => (
                  <EuiFlexItem key={idx}>{action}</EuiFlexItem>
                )
              )
            ) : (
              <EuiFlexItem>{actions}</EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiFlexItem>
      ) : null}
    </EuiFlexGroup>

    <EuiHorizontalRule margin="s" className={horizontalRuleClassName} />

    <div style={{ padding: '0px', ...bodyStyles }}>{children}</div>
  </EuiPanel>
);

export default ContentPanel;
