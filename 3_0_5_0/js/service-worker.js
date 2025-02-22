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
importScripts("config.js");

const handleInstall = async (details) => {
    if (details.reason === "install") {
        chrome.runtime.openOptionsPage();
        chrome.tabs.create({
            url: `https://www.mrfdev.com/event?n=install&b=chrome&e=enhancer-for-youtube&v=${chrome.runtime.getManifest().version}`,
            active: true
        });
        chrome.storage.local.set({
            date: Date.now(),
            update: Date.now()
        });
    } else if (details.reason === "update") {
        const localStorageData = await chrome.storage.local.get();
        const cacheStorage = {};
        if (/2\.0\.(10[3-9]|11[0-9]|12[0-1])/.test(details.previousVersion)) {
            if (Array.isArray(localStorageData.controls)) {
                cacheStorage.controls = localStorageData.controls.filter(d => d !== "whitelist" && d !== "not-interested");
            }
            await chrome.storage.local.remove(["blockads", "blockadsexceptforsubs", "whitelist"]);
        }
        if (/^2\.0/.test(details.previousVersion)) {
            cacheStorage.reload = true;
            cacheStorage.whatsnew = true;
            cacheStorage.videofilters = config.videofilters;
            const filters = "blur brightness contrast grayscale huerotate invert saturate sepia".split(" ");
            filters.forEach(d => {
                if (localStorageData[d]) {
                    if (d === "huerotate") cacheStorage.videofilters.rotation = localStorageData[d];
                    else if (d === "invert") cacheStorage.videofilters.inversion = localStorageData[d];
                    else if (d === "saturate") cacheStorage.videofilters.saturation = localStorageData[d];
                    else cacheStorage.videofilters[d] = localStorageData[d];
                }
            });
            if (localStorageData.backgroundcolor) {
                cacheStorage.backdropcolor = localStorageData.backgroundcolor;
                filters.push("backgroundcolor");
            }
            if (localStorageData.backgroundopacity) {
                cacheStorage.backdropopacity = localStorageData.backgroundopacity;
                filters.push("backgroundopacity");
            }
            if (localStorageData.customcssrules) {
                cacheStorage.customcss = localStorageData.customcssrules;
                filters.push("customcssrules");
            }
            await chrome.storage.local.remove(filters);
            if (localStorageData.miniplayersize) cacheStorage.miniplayersize = localStorageData.miniplayersize.replace("_", "");
            if (localStorageData.miniplayerposition) cacheStorage.miniplayerposition = localStorageData.miniplayerposition.replace("_", "");
            if (localStorageData.themevariant) {
                cacheStorage.vendorthemevariant = localStorageData.themevariant.replace("-youtube-light", "");
                cacheStorage.themevariant = config.themevariant;
            }
        }
        if (details.previousVersion !== chrome.runtime.getManifest().version) {
            cacheStorage.previousversion = details.previousVersion;
            cacheStorage.update = Date.now();
        }
        if (Object.keys(cacheStorage).length > 0) chrome.storage.local.set(cacheStorage);
    }
};

const handleMessage = async (message, a) => {
    switch (message.request) {
        case "pop-up-player":
            chrome.windows.create(message.options, b => {
                chrome.windows.update(b.id, { drawAttention: true });
            });
            break;
        case "options-page":
            chrome.runtime.openOptionsPage();
            break;
        case "whats-new":
            await chrome.storage.local.set({ whatsnew: false });
            chrome.tabs.create({ url: "html/whats-new.html", active: true });
            break;
        case "dark-theme-off":
            chrome.storage.local.set({ darktheme: false });
            break;
        case "keyboard-shortcuts":
            chrome.tabs.create({ url: "https://www.mrfdev.com/youtube-keyboard-shortcuts", active: true });
            break;
        case "configure-keyboard-shortcuts":
            chrome.tabs.create({ url: "chrome://extensions/shortcuts", active: true });
            break;
    }
};

const handleStorageChange = (changes) => {
    for (const a in changes) {
        if (changes[a].newValue !== undefined && a !== "customscript" && a !== "popuplayersize") {
            chrome.tabs.query({ url: "*://www.youtube.com/*" }, b => {
                b.forEach(e => {
                    chrome.tabs.sendMessage(e.id, {
                        message: "preference-changed",
                        name: a,
                        value: changes[a].newValue,
                        oldvalue: changes[a].oldValue
                    });
                });
            });
        }
    }
};

const handleCommand = (c) => {
    const commands = {
        "c070-toggle-loop": "loop",
        "c080-stop-video": "stop",
        "c090-reverse-playlist": "reverse-playlist",
        "c100-toggle-volume-booster": "volume-booster",
        "c130-toggle-annotations": "cards-end-screens",
        "c140-toggle-cinema-mode": "cinema-mode",
        "c150-toggle-player-size": "size",
        "c160-center-video-player": "size",
        "c170-pop-up-player": "pop-up-player",
        "c180-decrease-speed": "speed-minus",
        "c190-increase-speed": "speed-plus",
        "c200-default-speed": "speed",
        "c210-normal-speed": "speed",
        "c220-toggle-video-filters": "video-filters",
        "c230-flip-horizontally": "flip-horizontally",
        "c240-flip-vertically": "flip-vertically",
        "c250-take-screenshot": "screenshot",
        "c260-keyboard-shortcuts": "keyboard-shortcuts",
        "c270-custom-script": "custom-script"
    };
    switch (c) {
        case "c000-options-page":
            chrome.runtime.openOptionsPage();
            break;
        case "c020-theme-youtube-dark":
            chrome.storage.local.set({ darktheme: true, theme: "default-dark" });
            break;
        case "c025-theme-enhanced-dark":
            chrome.storage.local.set({ darktheme: true, theme: "enhanced-dark" });
            break;
        case "c030-theme-youtube-deep-dark":
            chrome.storage.local.set({ darktheme: true, theme: "youtube-deep-dark" });
            break;
        case "c040-theme-youtube-deep-dark-custom":
            chrome.storage.local.set({ darktheme: true, theme: "youtube-deep-dark-custom" });
            break;
        case "c050-theme-custom-theme":
            chrome.storage.local.get({ customtheme: config.customtheme }, b => {
                chrome.storage.local.set({ customtheme: !b.customtheme });
            });
            break;
        default:
            chrome.tabs.query({ lastFocusedWindow: true, active: true }, b => {
                chrome.tabs.sendMessage(b[0].id, {
                    message: "command",
                    command: c,
                    control: commands[c] || ""
                });
            });
    }
};

chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});

chrome.runtime.setUninstallURL(`https://www.mrfdev.com/event?n=uninstall&b=chrome&e=enhancer-for-youtube&v=${chrome.runtime.getManifest().version}`);

chrome.runtime.onInstalled.addListener(handleInstall);

chrome.runtime.onMessage.addListener(handleMessage);

chrome.storage.onChanged.addListener(handleStorageChange);

chrome.commands.onCommand.addListener(handleCommand);