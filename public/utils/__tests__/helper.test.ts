/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import rison from 'rison-node';
import { applicationServiceMock } from '../../../../../src/core/public/application/application_service.mock';
import { setApplication } from '../../services/utils/constants';
import {
  getActiveResponseExecutionsUrl,
  getErrorMessage,
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
      (appId: string, options: { path: string }) =>
        `http://localhost/app/${appId}${options.path}`
    );
    setApplication(app);

    const url = getActiveResponseExecutionsUrl('my-response');
    expect(url).toContain(
      'http://localhost/app/incident-response-dashboard#overview/'
    );
    expect(url).toContain('tabView=responses');

    const [, encodedAppState] = url.match(/_a=([^&]+)/) || [];
    const appState: any = rison.decode(decodeURIComponent(encodedAppState));
    expect(appState.filters[0].meta.key).toBe('wazuh.active_response.name');
    expect(appState.filters[0].meta.value).toBe('my-response');
  });
});
