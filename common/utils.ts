/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEFAULT_CHANNEL_CATEGORY, MANAGED_CHANNEL_CATEGORIES } from "./constants";

export function getChannelCategoryType(channel: string) {

    if (MANAGED_CHANNEL_CATEGORIES.includes(channel)){
        return channel;
    }
    return DEFAULT_CHANNEL_CATEGORY;
}

/** 
 * This function checks if the channel is a managed channel type by checking its category.
 * Managed channel types are those that fall under the categories defined in MANAGED_CHANNEL_CATEGORIES.
 * If the channel's category matches any of the managed categories, it is considered a managed channel type.
 * Otherwise, it is categorized as a notification channel type.
 * @param channel - The type of the channel to check.
 * @returns A boolean indicating whether the channel is a managed channel type (true) or not (false).
*/
export function isManagedChannelType(channel: string){
    return getChannelCategoryType(channel) !== DEFAULT_CHANNEL_CATEGORY;
}

