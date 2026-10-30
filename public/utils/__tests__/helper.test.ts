/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import rison from 'rison-node';
import { applicationServiceMock } from '../../../../../src/core/public/application/application_service.mock';
import { uiSettingsServiceMock } from '../../../../../src/core/public/ui_settings/ui_settings_service.mock';
import { setApplication, setUISettings } from '../../services/utils/constants';
import {
  getActiveResponseExecutionsUrl,
  getErrorMessage,
  getFindingsMonitorUrl,
  getTestMessageError,
  isAlertingAppAvailable,
  renderTime,
} from '../helpers';

describe('test helper functions', () => {
  it('returns default message if error not valid', () => {
    const message = getErrorMessage({}, 'default message');
    expect(message).toEqual('default message');
  });

  it('returns - if time is not valid', () => {
    const time = renderTime(NaN);
    expect(time).toEqual('-');
  });
});

describe('getActiveResponseExecutionsUrl', () => {
  it('returns an empty string when the incident-response-dashboard app is unavailable', () => {
    const app = applicationServiceMock.createStartContract();
    app.capabilities = { ...app.capabilities, navLinks: {} };
    setApplication(app);

    expect(getActiveResponseExecutionsUrl('my-response')).toBe('');
  });

  it('returns an empty string for an empty name', () => {
    const app = applicationServiceMock.createStartContract();
    app.capabilities = {
      ...app.capabilities,
      navLinks: { 'incident-response-dashboard': true },
    };
    setApplication(app);

    expect(getActiveResponseExecutionsUrl('')).toBe('');
  });

  it('returns a url filtered by name when the app is available', () => {
    const app = applicationServiceMock.createStartContract();
    app.capabilities = {
      ...app.capabilities,
      navLinks: { 'incident-response-dashboard': true },
    };
    (app.getUrlForApp as jest.Mock).mockImplementation(
      (appId: string, options: { path: string }) => `http://localhost/app/${appId}${options.path}`
    );
    setApplication(app);

    const url = getActiveResponseExecutionsUrl('my-response');
    expect(url).toContain('http://localhost/app/incident-response-dashboard#overview/');
    expect(url).toContain('tabView=responses');

    const [, encodedAppState] = url.match(/_a=([^&]+)/) || [];
    const appState: any = rison.decode(decodeURIComponent(encodedAppState));
    expect(appState.filters[0].meta.key).toBe('wazuh.active_response.name');
    expect(appState.filters[0].meta.value).toBe('my-response');
  });
});

// Wazuh
describe('getFindingsMonitorUrl', () => {
  const setupApplication = (navLinks: Record<string, boolean>) => {
    const app = applicationServiceMock.createStartContract();
    app.capabilities = { ...app.capabilities, navLinks };
    (app.getUrlForApp as jest.Mock).mockImplementation(
      (appId: string, options: { path: string }) =>
        `http://localhost/app/${appId}${options.path}`
    );
    setApplication(app);
  };
  const setUseUpdatedUx = (useUpdatedUx: boolean) => {
    const uiSettings = uiSettingsServiceMock.createStartContract();
    (uiSettings.get as jest.Mock).mockReturnValue(useUpdatedUx);
    setUISettings(uiSettings);
  };

  beforeEach(() => setUseUpdatedUx(false));

  it('returns an empty string when the alerting app is not installed', () => {
    setupApplication({});

    expect(isAlertingAppAvailable()).toBe(false);
    expect(getFindingsMonitorUrl('channel_id')).toBe('');
  });

  it('returns an empty string without a channel', () => {
    setupApplication({ alerting: true });

    expect(getFindingsMonitorUrl('')).toBe('');
  });

  it('opens the create monitor form with the findings preset for the channel', () => {
    setupApplication({ alerting: true });

    expect(isAlertingAppAvailable()).toBe(true);
    expect(getFindingsMonitorUrl('channel id/1')).toBe(
      'http://localhost/app/alerting#/create-monitor?preset=findings&channelId=channel%20id%2F1'
    );
  });

  it('uses the monitors app with the updated UX', () => {
    setUseUpdatedUx(true);
    setupApplication({ monitors: true });

    expect(getFindingsMonitorUrl('channel_id')).toBe(
      'http://localhost/app/monitors#/create-monitor?preset=findings&channelId=channel_id'
    );
  });
});

describe('getTestMessageError', () => {
  const failure = (statusText: string) => ({
    body: {
      message: `[status_exception] ${JSON.stringify({
        event_status_list: [
          { delivery_status: { status_code: '400', status_text: statusText } },
        ],
      })}`,
    },
  });

  it('explains a host denied by the deny list and keeps the raw response', () => {
    const error = failure(
      'Webhook message creation failed with status:Host of url is denied, based on plugin setting [notification.core.http.host_deny_list]'
    );

    const testMessageError = getTestMessageError(error);

    expect(testMessageError?.message).toBe(
      'The host of the URL is blocked by the indexer setting opensearch.notifications.core.http.host_deny_list. Ask an administrator to update it.'
    );
    expect(testMessageError?.stack).toBe(error.body.message);
  });

  it('uses the delivery status text for other failures', () => {
    expect(getTestMessageError(failure('Connection refused'))?.message).toBe(
      'Connection refused'
    );
  });

  it('reads the failed delivery that sendTestMessage throws', () => {
    const error = new Error('Failed to send the test message.');
    error.stack = JSON.stringify(
      {
        status_list: [
          {
            delivery_status: { status_code: '500', status_text: 'Bad gateway' },
          },
        ],
      },
      null,
      2
    );

    expect(getTestMessageError(error)?.message).toBe('Bad gateway');
  });

  it('returns undefined when the failure has no delivery status', () => {
    expect(
      getTestMessageError({ body: { message: 'Internal Server Error' } })
    ).toBeUndefined();
  });
});
