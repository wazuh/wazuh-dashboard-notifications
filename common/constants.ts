export const BACKEND_CHANNEL_TYPE = Object.freeze({
  SLACK: 'slack',
  EMAIL: 'email',
  CHIME: 'chime',
  MICROSOFT_TEAMS: 'microsoft_teams',
  CUSTOM_WEBHOOK: 'webhook',
  SNS: 'sns',
  MATTERMOST: 'mattermost',
  // Wazuh
  ACTIVE_RESPONSE: 'active_response',
});
export const CHANNEL_TYPE = Object.freeze({
  [BACKEND_CHANNEL_TYPE.SLACK]: 'Slack',
  [BACKEND_CHANNEL_TYPE.EMAIL]: 'Email',
  [BACKEND_CHANNEL_TYPE.CHIME]: 'Chime',
  [BACKEND_CHANNEL_TYPE.MICROSOFT_TEAMS]: 'Microsoft Teams',
  [BACKEND_CHANNEL_TYPE.CUSTOM_WEBHOOK]: 'Custom webhook',
  [BACKEND_CHANNEL_TYPE.SNS]: 'Amazon SNS',
  [BACKEND_CHANNEL_TYPE.MATTERMOST]: 'Mattermost',
  // Wazuh
  [BACKEND_CHANNEL_TYPE.ACTIVE_RESPONSE]: 'Active response',
}) as {
  slack: string;
  email: string;
  chime: string;
  microsoft_teams: string;
  webhook: string;
  sns: string;
  mattermost: string;
  // Wazuh  
  active_response: string;
};

// Wazuh
export const ACTIVE_RESPONSE_TYPE = Object.freeze({
  STATELESS: 'stateless',
  STATEFUL: 'stateful',
});

export const ACTIVE_RESPONSE_TYPE_LABEL = Object.freeze({
  [ACTIVE_RESPONSE_TYPE.STATELESS]: 'Stateless',
  [ACTIVE_RESPONSE_TYPE.STATEFUL]: 'Stateful',
});

export const ACTIVE_RESPONSE_LOCATION = Object.freeze({
  ALL: 'all',
  DEFINED_AGENT: 'defined-agent',
  LOCAL: 'local',
});

export const ACTIVE_RESPONSE_LOCATION_LABEL = Object.freeze({
  [ACTIVE_RESPONSE_LOCATION.ALL]: 'All',
  [ACTIVE_RESPONSE_LOCATION.DEFINED_AGENT]: 'Defined agent',
  [ACTIVE_RESPONSE_LOCATION.LOCAL]: 'Local',
});

/* This constant defines the categories of channels that are considered "managed" by the system.
Managed channels are those that have specific handling, as opposed
to generic notification channels. By categorizing channels into managed and notification types,
the system can apply different logic or UI elements based on the channel category. */
export const MANAGED_CHANNEL_CATEGORIES = Object.freeze([BACKEND_CHANNEL_TYPE.ACTIVE_RESPONSE] as const); 

// This constant defines the default category for channels that do not fall under the managed categories.
export const DEFAULT_CHANNEL_CATEGORY = 'notification';