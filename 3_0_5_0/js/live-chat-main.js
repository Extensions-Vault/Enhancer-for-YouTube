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
((document) => {
    const createCustomColorsStyle = () => {
        const styles = [];
        for (const [key, value] of Object.entries(preferences.customcolors)) {
            let styleValue = value;
            if (key === "--shadow") {
                const hex = value.replace("#", "");
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                styleValue = `0 1px .5px rgba(${r}, ${g}, ${b}, .2)`;
            }
            styles.push(`${key}:${styleValue}`);
        }
        return `:root{${styles.join(";")}}`;
    };

    const applyDarkTheme = () => {
        if (preferences.darktheme && preferences.theme !== "default-dark") {
            const link = document.createElement("link");
            link.id = "efyt-dark-theme";
            link.rel = "stylesheet";
            link.href = (preferences.theme === "enhanced-dark" ? enhancedDarkThemeUrl : vendorThemeUrl) + `main.css?v=${version}`;
            document.head.appendChild(link);
        }
    };

    const applyDarkThemeColors = () => {
        if (preferences.darktheme && preferences.theme !== "default-dark") {
            let link;
            if (preferences.theme === "enhanced-dark" || preferences.theme === "youtube-deep-dark") {
                link = document.createElement("link");
                link.id = "efyt-dark-theme-colors";
                link.rel = "stylesheet";
                link.href = preferences.theme === "enhanced-dark" ? enhancedDarkThemeUrl + preferences.themevariant : vendorThemeUrl + preferences.vendorthemevariant;
            } else if (preferences.theme === "youtube-deep-dark-custom") {
                link = document.createElement("style");
                link.id = "efyt-dark-theme-colors";
                link.textContent = createCustomColorsStyle();
            }
            document.head.appendChild(link);
        }
    };

    const applyCustomTheme = () => {
        if (preferences.customtheme) {
            const style = document.createElement("style");
            style.id = "efyt-custom-theme";
            style.textContent = preferences.customcss;
            document.head.appendChild(style);
        }
    };

    let preferences, version, enhancedDarkThemeUrl, vendorThemeUrl, pendingFunctions;

    document.addEventListener("DOMContentLoaded", () => {
        if (preferences) {
            applyDarkThemeColors();
            applyDarkTheme();
            applyCustomTheme();
        } else {
            pendingFunctions = [applyDarkThemeColors, applyDarkTheme, applyCustomTheme];
        }
    }, { once: true });

    document.addEventListener("efyt-init", (event) => {
        preferences = event.detail.prefs;
        version = event.detail.version;
        enhancedDarkThemeUrl = event.detail.themes;
        vendorThemeUrl = event.detail.vendorthemes;
        if (pendingFunctions) {
            pendingFunctions.forEach(fn => fn());
        }
    }, { once: true });

    document.addEventListener("efyt-preference-changed", (event) => {
        const { name, value } = event.detail;
        preferences[name] = value;
        switch (name) {
            case "customcolors":
                const customColorsStyle = document.head.querySelector("#efyt-dark-theme-colors");
                if (customColorsStyle) customColorsStyle.textContent = createCustomColorsStyle();
                break;
            case "customcss":
                const customThemeStyle = document.head.querySelector("#efyt-custom-theme");
                if (customThemeStyle) customThemeStyle.textContent = value;
                break;
            case "customtheme":
                const existingCustomThemeStyle = document.head.querySelector("#efyt-custom-theme");
                if (value && !existingCustomThemeStyle) {
                    applyCustomTheme();
                } else if (!value && existingCustomThemeStyle) {
                    document.head.removeChild(existingCustomThemeStyle);
                }
                break;
            case "darktheme":
            case "theme":
                const darkThemeLink = document.head.querySelector("#efyt-dark-theme");
                const darkThemeColorsLink = document.head.querySelector("#efyt-dark-theme-colors");
                if ((name === "darktheme" && !value) || preferences.theme === "default-dark") {
                    if (darkThemeLink) document.head.removeChild(darkThemeLink);
                    if (darkThemeColorsLink) document.head.removeChild(darkThemeColorsLink);
                } else {
                    if (darkThemeColorsLink) document.head.removeChild(darkThemeColorsLink);
                    applyDarkThemeColors();
                    if (darkThemeLink) {
                        darkThemeLink.href = (preferences.theme === "enhanced-dark" ? enhancedDarkThemeUrl : vendorThemeUrl) + `main.css?v=${version}`;
                    } else {
                        applyDarkTheme();
                    }
                    if (preferences.customtheme) {
                        const customThemeStyle = document.head.querySelector("#efyt-custom-theme");
                        if (customThemeStyle) document.head.appendChild(customThemeStyle);
                    }
                }
                break;
            case "themevariant":
            case "vendorthemevariant":
                const themeColorsLink = document.head.querySelector("#efyt-dark-theme-colors");
                if (themeColorsLink && themeColorsLink.hasAttribute("href")) {
                    themeColorsLink.href = (preferences.theme === "enhanced-dark" ? enhancedDarkThemeUrl : vendorThemeUrl) + value;
                }
                break;
        }
    });
})(document);