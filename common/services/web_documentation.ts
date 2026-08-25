/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DOCUMENTATION_WEB_BASE_URL, PLUGIN_VERSION_SHORT } from '../constants';

/**
 * Generate a URL to the web documentation taking in account the plugin short
 * version or the specified version.
 * @param urlPath Relative path to the base URL + version.
 * @param version version. Optional. It uses the plugin short version by default.
 */
export function webDocumentationLink(
  urlPath: string,
  version: string = PLUGIN_VERSION_SHORT
): string {
  return `${DOCUMENTATION_WEB_BASE_URL}/${version}/${urlPath}`;
}
