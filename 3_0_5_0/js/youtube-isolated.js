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
(f => {
    const handleMessage = a => {
        if (a.message === "command") {
            document.dispatchEvent(new CustomEvent("efyt-command", {
                detail: {
                    command: a.command,
                    control: a.control
                }
            }));
        } else if (a.message === "preference-changed") {
            document.dispatchEvent(new CustomEvent("efyt-preference-changed", {
                detail: {
                    name: a.name,
                    value: a.value,
                    oldvalue: a.oldvalue
                }
            }));
        }
    };

    const handleEfytMessage = async a => {
        a = a.detail;
        try {
            if (a.request === "pop-up-player") {
                let b = "https://www.youtube.com/pop-up-player/";
                const playerSize = (await chrome.storage.local.get({ popuplayersize: f.popuplayersize })).popuplayersize.split("x");
                const d = { request: a.request };

                if (a.playlist) {
                    await chrome.storage.local.set({ playlist: a.params });
                    b += `${a.params.videos[a.params.index]}?autoplay=1`;
                } else {
                    b += a.params;
                }

                d.options = {
                    url: b,
                    type: "popup",
                    height: parseInt(playerSize[1], 10) + 9 + 30,
                    width: parseInt(playerSize[0], 10) + 16,
                    incognito: chrome.extension.inIncognitoContext,
                    focused: true
                };
                a = d;
            }
            chrome.runtime.sendMessage(a);
        } catch (e) {
            document.body.classList.add("efyt-reload-message");
        }
    };

    const handleEfytGetMessages = () => {
        try {
            const localeCode = chrome.i18n.getMessage("locale_code");
            const videoEffectOptions = "boost_volume brightness cinema_mode color_inversion contrast custom_script expand flip_horizontally flip_vertically gaussian_blur grayscale hue_rotation keyboard_shortcuts locale_dir loop loop_end loop_start message options page_reload_required pop_up_player reset reverse_playlist saturation screenshot sepia shrink speed stop toggle_visibility video_filters".split(" ");
            chrome.storage.local.get({ localecode: f.localecode, whatsnew: f.whatsnew }, c => {
                const d = {};
                if (localeCode === c.localecode) {
                    videoEffectOptions.forEach(key => d[key] = chrome.i18n.getMessage(key));
                    document.dispatchEvent(new CustomEvent("efyt-set-messages", {
                        detail: { messages: d }
                    }));
                } else {
                    fetch(chrome.runtime.getURL(`_locales/${c.localecode}/messages.json`))
                        .then(h => h.json())
                        .then(h => {
                            videoEffectOptions.forEach(key => d[key] = h[key].message);
                            document.dispatchEvent(new CustomEvent("efyt-set-messages", {
                                detail: { messages: d }
                            }));
                        });
                }
                if (c.whatsnew) {
                    chrome.runtime.sendMessage({ request: "whats-new" });
                }
            });
        } catch (c) {
            document.body.classList.add("efyt-reload-message");
        }
    };

    const handleEfytVideoFilters = a => {
        chrome.storage.local.set({
            filter: a.detail.filter,
            videofilters: a.detail.videofilters
        });
    };

    const initialize = a => {
        document.dispatchEvent(new CustomEvent("efyt-init", {
            detail: {
                prefs: a,
                reload: a.reload,
                version: chrome.runtime.getManifest().version,
                previousversion: a.previousversion,
                themes: chrome.runtime.getURL("css/themes/"),
                vendorthemes: chrome.runtime.getURL("vendor/themes/")
            }
        }));
        if (a.reload) {
            setTimeout(() => {
                chrome.storage.local.set({ reload: false });
            }, 5000);
        }
    };

    window.wrappedJSObject || (
        chrome.runtime.onMessage.addListener(handleMessage),
        document.addEventListener("efyt-message", handleEfytMessage),
        document.addEventListener("efyt-get-messages", handleEfytGetMessages),
        document.addEventListener("efyt-video-filters", handleEfytVideoFilters),
        chrome.storage.local.get(f, initialize)
    );
})(config);