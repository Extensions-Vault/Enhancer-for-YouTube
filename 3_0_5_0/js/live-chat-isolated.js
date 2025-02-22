/*
##
##  Enhancer for YouTube™
##  =====================
##
##  Author: Maxime RF <https://www.mrfdev.com>
##
##  This file is protected by copyright laws and international copyright
##  treaties, as well as other intellectual property laws and treaties.
##
##  All rights not expressly granted to you are retained by the author.
##  Read the license.txt file for more details.
##
##  © MRFDEV.com - All Rights Reserved
##
*/
((config) => {
    if (!window.wrappedJSObject) {
        chrome.storage.onChanged.addListener((changes) => {
            for (const key in changes) {
                if (changes[key].newValue !== undefined && Object.hasOwn(config, key)) {
                    document.dispatchEvent(new CustomEvent("efyt-preference-changed", {
                        detail: {
                            name: key,
                            value: changes[key].newValue
                        }
                    }));
                }
            }
        });

        chrome.storage.local.get(config, (prefs) => {
            document.dispatchEvent(new CustomEvent("efyt-init", {
                detail: {
                    prefs: prefs,
                    version: chrome.runtime.getManifest().version,
                    themes: chrome.runtime.getURL("css/themes/"),
                    vendorthemes: chrome.runtime.getURL("vendor/themes/")
                }
            }));
        });
    }
})(configLiveChat);