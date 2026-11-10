/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router, Route } from 'react-router-dom';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { CoreServicesContext } from './components/coreServices';
import Main from './pages/Main';
import { DataSourceManagementPluginSetup } from '../../../src/plugins/data_source_management/public';
import { AppPluginStartDependencies } from "./types";
// Wazuh: adds the Notifications docs to the Help menu
import { setNotificationsHelpExtension } from './utils/helpExtension';

export const renderApp = (
  coreStart: CoreStart,
  params: AppMountParameters,
  dataSourceManagement: DataSourceManagementPluginSetup,
  pluginStartDependencies: AppPluginStartDependencies,
  defaultRoute?: string,
) => {
  // Wazuh: link the docs of this screen from the Help menu
  setNotificationsHelpExtension(coreStart.chrome, 'Notifications');
  const root = createRoot(params.element);
  root.render(
    <Router>
      <Route
        render={(props) => (
            <CoreServicesContext.Provider value={coreStart}>
              <Main {...props}
                setActionMenu={params.setHeaderActionMenu}
                multiDataSourceEnabled={!!pluginStartDependencies.dataSource}
                dataSourceManagement={dataSourceManagement}
                http={coreStart.http} // Pass http as a prop
                defaultRoute={defaultRoute}
              />
            </CoreServicesContext.Provider>
        )}
      />
    </Router>
  );

  return () => root.unmount();
};
