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
((document, Configurations) => {
    // OK
    function saveOptionToLocalStorage() {
        var a = {};
        this.name ? a[this.name] = this.value : a[this.id] = this.checked;
        chrome.storage.local.set(a);
    }

    // OK
    function saveSelectedControls() {
        for (var a = [], d = 0; d < controlCheckboxes.length; d++) controlCheckboxes[d].checked && a.push(controlCheckboxes[d].id);
        chrome.storage.local.set({
            controls: a
        });
    }

    // OK
    function saveCustomColors() {
        for (var a = {}, d = 0; d < customColorPickers.length; d++) a[customColorPickers[d].name] = customColorPickers[d].value;
        chrome.storage.local.set({
            customcolors: a
        });
    }

    // OK
    function toggleCustomColors() {
        const isDisabled = document.querySelector('input[name="theme"]:checked').value !== "youtube-deep-dark-custom";
        customColorPickers.forEach(colorInput => colorInput.disabled = isDisabled);
        ResetCustomColorsButton.disabled = isDisabled;
    }

    function loadLocaleMessages() {
        fetch(chrome.runtime.getURL(`_locales/${localeCode}/messages.json`)).then(a => a.json()).then(a => {
            LocaleDirectory = a.locale_dir.message;
            document.documentElement.lang = localeCode.replace("_", "-");
            document.body.dir = LocaleDirectory;
            for (var d = i18nElements.length - 1; 0 <= d; d--) i18nElements[d].textContent = a[i18nElements[d].dataset.text].message;
            for (d = playerControlInfoElements.length - 1; 0 <= d; d--) playerControlInfoElements[d].dataset.tooltip = a[playerControlInfoElements[d].dataset.message].message;
            document.querySelector("#customcss").setAttribute("placeholder", a.custom_theme_instructions.message);
            document.querySelector("#customscript").setAttribute("placeholder", a.custom_script_instructions.message);
            chrome.storage.local.set({
                localecode: localeCode,
                localedir: LocaleDirectory
            });
        });
    }

    // OK
    function openModal(modalElement) {
        document.body.classList.add("overflow-hidden");
        ModalBackdrop.style.display = "block";
        modalElement.style.display = "block";
        modalElement.scrollTop = 0;
        ModalBackdrop.classList.add("in");
        setTimeout(() => {
            document.body.classList.add("modal-open");
            modalElement.querySelector("button.close-modal").focus();
        }, 50);
    }

    // OK
    function closeModal(modalElement) {
        document.body.classList.remove("modal-open");
        setTimeout(() => {
            modalElement.style.display = "none";
            ModalBackdrop.classList.add("fade");
            ModalBackdrop.classList.remove("in");
            setTimeout(() => {
                ModalBackdrop.style.display = "none";
                document.body.classList.remove("overflow-hidden");
                if (modalElement.id === "donate-modal") {
                    document.querySelector("nav .donate a").focus();
                } else if (modalElement.id === "backup-modal") {
                    document.querySelector("fieldset.backup button").focus();
                }
            }, 300);
        }, 300);
    }

    // OK
    function applyInsetShadowStyles() {
        var mainElement = document.querySelector("main"),
            styleElement = document.createElement("style");
        styleElement.textContent = `:root{--main-inset-shadow-top:${mainElement.offsetTop}px;--main-inset-shadow-width:${mainElement.clientWidth}px}`;
        document.head.appendChild(styleElement);
    }

    // OK
    var localeCode = chrome.i18n.getMessage("locale_code"),
        LocaleDirectory = chrome.i18n.getMessage("locale_dir"),
        i18nElements = document.querySelectorAll(".i18n"),
        mainElement = document.querySelector("main"),
        tooltipElement = document.querySelector(".tooltip"),
        ModalBackdrop = document.querySelector("#modal-backdrop"),
        customColorPickers = document.querySelectorAll('#customcolors input[type="color"]'),
        ResetCustomColorsButton = document.querySelector("#reset-custom-colors"),
        playerControlInfoElements = document.querySelectorAll(".player-control .info"),
        controlCheckboxes;

    // OK
    chrome.storage.onChanged.addListener((changes) => {
        for (const key in changes) {
            const newValue = changes[key].newValue;
            if (newValue === undefined) continue;

            switch (key) {
                case "darktheme":
                    if (newValue !== document.querySelector("#darktheme").checked) {
                        document.querySelector("#darktheme").click();
                    }
                    break;
                case "theme":
                    if (newValue !== document.querySelector('input[name="theme"]:checked').value) {
                        document.querySelector(`input[name="theme"][value="${newValue}"]`).checked = true;
                        document.querySelector("#themevariant").disabled = newValue !== "enhanced-dark";
                        document.querySelector("#vendorthemevariant").disabled = newValue !== "youtube-deep-dark";
                        toggleCustomColors();
                    }
                    break;
                case "customtheme":
                    const customThemeCheckbox = document.querySelector("#customtheme");
                    if (customThemeCheckbox.checked !== newValue) {
                        customThemeCheckbox.checked = newValue;
                    }
                    document.querySelector("#customcss").disabled = !newValue;
                    document.querySelector("#customcss-btn").disabled = !newValue;
                    break;
            }
        }
    });

    //////
    chrome.storage.local.get(Configurations, a => {
        if (localeCode === a.localecode) {
            document.documentElement.lang = localeCode.replace("_", "-");
            document.body.dir = LocaleDirectory;
            for (var btn2 = i18nElements.length - 1; 0 <= btn2; btn2--) i18nElements[btn2].textContent = chrome.i18n.getMessage(i18nElements[btn2].dataset.text);
            for (btn2 = playerControlInfoElements.length - 1; 0 <= btn2; btn2--) playerControlInfoElements[btn2].dataset.tooltip = chrome.i18n.getMessage(playerControlInfoElements[btn2].dataset.message);
            document.querySelector("#customcss").setAttribute("placeholder", chrome.i18n.getMessage("custom_theme_instructions"));
            document.querySelector("#customscript").setAttribute("placeholder", chrome.i18n.getMessage("custom_script_instructions"));
        } else localeCode = a.localecode, loadLocaleMessages();
        btn2 = document.querySelectorAll("nav a, aside a");
        btn2.forEach(b => {
            b.addEventListener("focus", function () {
                this.parentNode.classList.add("focus");
            });
            b.addEventListener("blur", function () {
                this.parentNode.classList.remove("focus");
            });
        });
        btn2[0].addEventListener("click", b => {
            b.preventDefault();
            mainElement.scrollTo(0, 0);
        });
        var k = document.querySelector("nav .donate a"),
            z = document.querySelector("#donate-modal"),
            ua = z.querySelector(".close-modal");
        k.addEventListener("click", b => {
            b.preventDefault();
            b = 0 > "bg ca cs da de el es et fi fr hr hu it lt lv nl pl pt_PT ro sk sl sv".indexOf(localeCode) ? "USD" : "EUR";
            z.querySelector(".donate-buttons").dataset.currencyCode = b;
            openModal(z);
        });
        z.querySelectorAll(".donate-buttons button").forEach(b => {
            b.addEventListener("click", function () {
                var e = 0 > "bg ca cs da de el es et fi fr hr hu it lt lv nl pl pt_PT ro sk sl sv".indexOf(localeCode) ? "USD" : "EUR";
                e = k.dataset.paypal.replace(/AMOUNT/, this.dataset.amount).replace(/CURRENCY_CODE/, e);
                chrome.tabs.create({
                    url: e,
                    active: true
                });
            });
        });
        ua.addEventListener("click", () => {
            closeModal(z);
        });
        btn2 = document.querySelector("#locale");
        btn2.value = localeCode;
        btn2.addEventListener("change", function () {
            localeCode = this.value;
            loadLocaleMessages();
        });
        btn2.addEventListener("focus", function () {
            this.parentNode.classList.add("focus");
        });
        btn2.addEventListener("blur", function () {
            this.parentNode.classList.remove("focus");
        });
        document.querySelectorAll("aside a").forEach(b => {
            b.addEventListener("click", e => {
                e.preventDefault();
                var g = document.querySelector("fieldset." + e.target.dataset.target);
                mainElement.scrollTop = 0 === mainElement.scrollTop ? 1 : mainElement.scrollTop - 1;
                mainElement.addEventListener("scrollend", function Ga() {
                    mainElement.removeEventListener("scrollend", Ga);
                    g.classList.add("highlighted");
                    g.querySelector("input, textarea, select:not(.hidden), button").focus();
                });
                g.scrollIntoView();
            });
        });
        "#applyvideofilters #blackbars #blockhfrformats #blockwebmformats #boostvolume #cinemamode #cinemamodewideplayer #convertshorts #executescript #expanddescription #hidecardsendscreens #hidechat #hidecomments #hiderelated #hideshorts #newestcomments #reversemousewheeldirection #theatermode #wideplayer #wideplayerviewport".split(" ").forEach(b => {
            b = document.querySelector(b);
            b.checked = a[b.id];
            b.addEventListener("click", saveOptionToLocalStorage);
        });
        document.querySelector("#keyboard-shortcuts-btn").addEventListener("click", () => {
            chrome.runtime.sendMessage({
                request: "configure-keyboard-shortcuts"
            });
        });
        controlCheckboxes = document.querySelectorAll('.player-control input[type="checkbox"]');
        for (btn2 = 0; btn2 < controlCheckboxes.length; btn2++) controlCheckboxes[btn2].checked = -1 < a.controls.indexOf(controlCheckboxes[btn2].id) ? true : false, controlCheckboxes[btn2].addEventListener("click", saveSelectedControls);
        playerControlInfoElements = document.querySelectorAll(".player-control .info");
        for (btn2 = playerControlInfoElements.length - 1; 0 <= btn2; btn2--) playerControlInfoElements[btn2].addEventListener("click", b => {
            b.preventDefault();
        }), playerControlInfoElements[btn2].addEventListener("mouseenter", b => {
            b = b.target;
            var e = b.getBoundingClientRect();
            tooltipElement.textContent = b.dataset.tooltip;
            tooltipElement.style.setProperty("top", "calc(" + e.top + "px - .5rem)");
            tooltipElement.style.setProperty("left", e.left + "px");
            tooltipElement.classList.add("visible");
        }), playerControlInfoElements[btn2].addEventListener("mouseleave", () => {
            tooltipElement.classList.remove("visible");
        });
        var btn = document.querySelectorAll('input[name="controlbaractive"]'),
            E = document.querySelector("#controlsvisible"),
            F = document.querySelector("#controlbarposition"),
            va = document.querySelector("#control-bar-centering"),
            G = document.querySelector("#controlbarcentered"),
            wa = document.querySelector("#control-bar-visibility"),
            H = document.querySelector("#controlbarautohide");
        for (btn2 = 0; btn2 < btn.length; btn2++) btn[btn2].value === String(a.controlbar.active) && (btn[btn2].checked = true), btn[btn2].addEventListener("click", function () {
            "false" === this.value ? (a.controlbar.active = false, E.disabled = false, F.disabled = true, G.disabled = true, H.disabled = true) : (a.controlbar.active = true, E.disabled = true, F.disabled = false, G.disabled = false, H.disabled = false);
            chrome.storage.local.set({
                controlbar: a.controlbar
            });
        });
        E.checked = a.controlsvisible;
        E.disabled = a.controlbar.active;
        E.addEventListener("click", saveOptionToLocalStorage);
        F.value = a.controlbar.position;
        F.disabled = !a.controlbar.active;
        F.addEventListener("change", function () {
            va.classList["absolute" === this.value ? "remove" : "add"]("hidden");
            wa.classList["fixed" === this.value ? "remove" : "add"]("hidden");
            a.controlbar.position = this.value;
            chrome.storage.local.set({
                controlbar: a.controlbar
            });
        });
        va.classList["absolute" === a.controlbar.position ? "remove" : "add"]("hidden");
        G.checked = a.controlbar.centered;
        G.disabled = !a.controlbar.active;
        G.addEventListener("click", function () {
            a.controlbar.centered = this.checked;
            chrome.storage.local.set({
                controlbar: a.controlbar
            });
        });
        wa.classList["fixed" === a.controlbar.position ? "remove" : "add"]("hidden");
        H.checked = a.controlbar.autohide;
        H.disabled = !a.controlbar.active;
        H.addEventListener("click", function () {
            a.controlbar.autohide = this.checked;
            chrome.storage.local.set({
                controlbar: a.controlbar
            });
        });
        btn2 = document.querySelector("#backdropcolor");
        btn = document.querySelector("#backdropopacity");
        var Ha = document.querySelector("#opacity"),
            Ia = document.querySelector("#cinemamode-backdrop"),
            ja = () => {
                var b = a.backdropcolor.replace("#", ""),
                    e = parseInt(b.substring(0, 2), 16),
                    g = parseInt(b.substring(2, 4), 16);
                b = parseInt(b.substring(4, 6), 16);
                Ha.textContent = a.backdropopacity + "%";
                Ia.style.backgroundColor = `rgba(${e}, ${g}, ${b}, ${a.backdropopacity / 100})`;
            };
        btn2.value = a.backdropcolor;
        btn2.addEventListener("input", function () {
            a.backdropcolor = this.value;
            ja();
            chrome.storage.local.set({
                backdropcolor: this.value
            });
        });
        btn2.addEventListener("change", saveOptionToLocalStorage);
        btn.value = a.backdropopacity;
        btn.addEventListener("input", function () {
            a.backdropopacity = Number(this.value);
            ja();
            chrome.storage.local.set({
                backdropopacity: a.backdropopacity
            });
        });
        ja();
        var I = document.querySelector("#playback-speed"),
            J = document.querySelector("#custom-playback-speed");
        btn2 = document.querySelector("#overridespeeds");
        var P = document.querySelector("#speedvariation");
        btn = document.querySelector("#defaultvolume");
        var Q = document.querySelector("#volume"),
            xa = document.querySelector("#volume-preview"),
            u = document.querySelector("#volumemultiplier"),
            R = document.querySelector("#controlspeed"),
            S = document.querySelector("#controlspeedmousebutton"),
            ya = document.querySelector("#controlvolume"),
            T = document.querySelector("#controlvolumemousebutton"),
            U = document.querySelector("#volumevariation"),
            za = document.querySelector("#miniplayer"),
            V = document.querySelector("#miniplayersize"),
            W = document.querySelector("#miniplayerposition");
        I.value = a.overridespeeds ? 1 : a.speed;
        I.addEventListener("change", function () {
            chrome.storage.local.set({
                speed: parseFloat(this.value)
            });
        });
        J.value = a.overridespeeds ? a.speed : 1;
        J.addEventListener("change", function () {
            chrome.storage.local.set({
                speed: parseFloat(this.value)
            });
        });
        a.overridespeeds && (I.classList.add("hidden"), J.classList.remove("hidden"));
        btn2.checked = a.overridespeeds;
        btn2.addEventListener("click", function () {
            P.disabled = !this.checked;
            var b = document.querySelector("#playback-speed-label");
            b.classList.add("animated", "blink");
            setTimeout(() => {
                b.classList.remove("animated", "blink");
            }, 2400);
            I.classList.toggle("hidden");
            J.classList.toggle("hidden");
            chrome.storage.local.set({
                overridespeeds: this.checked,
                speed: parseFloat(this.checked ? J.value : I.value)
            });
        });
        P.value = a.speedvariation;
        P.disabled = !a.overridespeeds;
        P.addEventListener("change", function () {
            chrome.storage.local.set({
                speedvariation: parseFloat(this.value)
            });
        });
        R.checked = a.controlspeed;
        R.addEventListener("click", function () {
            S.disabled = !this.checked;
            chrome.storage.local.set({
                controlspeed: this.checked
            });
        });
        S.checked = a.controlspeedmousebutton;
        S.disabled = !a.controlspeed;
        S.addEventListener("click", saveOptionToLocalStorage);
        btn.checked = a.defaultvolume;
        btn.addEventListener("click", function () {
            Q.disabled = !this.checked;
            chrome.storage.local.set({
                defaultvolume: this.checked
            });
        });
        Q.value = a.volume;
        Q.disabled = !a.defaultvolume;
        Q.addEventListener("input", function () {
            a.volume = Number(this.value);
            xa.textContent = a.volume;
            chrome.storage.local.set({
                volume: a.volume
            });
        });
        xa.textContent = a.volume;
        u.value = a.volumemultiplier;
        u.addEventListener("change", function () {
            chrome.storage.local.set({
                volumemultiplier: Number(this.value)
            });
        });
        ya.checked = a.controlvolume;
        ya.addEventListener("click", function () {
            T.disabled = !this.checked;
            U.disabled = !this.checked;
            chrome.storage.local.set({
                controlvolume: this.checked
            });
        });
        T.checked = a.controlvolumemousebutton;
        T.disabled = !a.controlvolume;
        T.addEventListener("click", saveOptionToLocalStorage);
        U.value = a.volumevariation;
        U.disabled = !a.controlvolume;
        U.addEventListener("change", function () {
            chrome.storage.local.set({
                volumevariation: Number(this.value)
            });
        });
        u.value = a.volumemultiplier;
        u.addEventListener("change", function () {
            chrome.storage.local.set({
                volumemultiplier: Number(this.value)
            });
        });
        za.checked = a.miniplayer;
        za.addEventListener("click", function () {
            V.disabled = !this.checked;
            W.disabled = !this.checked;
            chrome.storage.local.set({
                miniplayer: this.checked
            });
        });
        V.value = a.miniplayersize;
        V.disabled = !a.miniplayer;
        V.addEventListener("change", saveOptionToLocalStorage);
        W.value = a.miniplayerposition;
        W.disabled = !a.miniplayer;
        W.addEventListener("change", saveOptionToLocalStorage);
        btn2 = document.querySelector("#blockautoplay");
        var X = document.querySelector("#pauseforegroundtab"),
            Y = document.querySelector("#ignoreplaylists"),
            Z = document.querySelector("#stopvideos");
        btn2.checked = a.blockautoplay;
        btn2.addEventListener("click", function () {
            X.disabled = !this.checked;
            Y.disabled = !this.checked;
            Z.disabled = !this.checked;
            chrome.storage.local.set({
                blockautoplay: this.checked
            });
        });
        X.checked = a.pauseforegroundtab;
        X.disabled = !a.blockautoplay;
        X.addEventListener("click", saveOptionToLocalStorage);
        Y.checked = a.ignoreplaylists;
        Y.disabled = !a.blockautoplay;
        Y.addEventListener("click", saveOptionToLocalStorage);
        Z.checked = a.stopvideos;
        Z.disabled = !a.blockautoplay;
        Z.addEventListener("click", saveOptionToLocalStorage);
        btn2 = document.querySelector("#pausevideos");
        var aa = document.querySelector("#ignorepopupplayer");
        btn2.checked = a.pausevideos;
        btn2.addEventListener("click", function () {
            aa.disabled = !this.checked;
            chrome.storage.local.set({
                pausevideos: this.checked
            });
        });
        aa.checked = a.ignorepopupplayer;
        aa.disabled = !a.pausevideos;
        aa.addEventListener("click", saveOptionToLocalStorage);
        btn2 = document.querySelector("#disableautoplay");
        var Aa = document.querySelector(".autoplay-toggle-button");
        btn2.checked = a.disableautoplay;
        Aa.setAttribute("aria-checked", !a.disableautoplay);
        btn2.addEventListener("click", function () {
            Aa.setAttribute("aria-checked", !this.checked);
            chrome.storage.local.set({
                disableautoplay: this.checked
            });
        });
        var ka = document.querySelector("#selectquality"),
            v = document.querySelector("#selectqualityfullscreenon"),
            K = document.querySelector("#selectqualityfullscreenoff"),
            ba = ["#qualityvideos", "#qualityplaylists", "#qualityembeds"],
            ca = ["#qualityvideosfullscreen", "#qualityplaylistsfullscreen", "#qualityembedsfullscreen"];
        ka.checked = a.selectquality;
        ka.addEventListener("click", function () {
            ba.forEach(b => {
                document.querySelector(b).disabled = !ka.checked;
            });
            v.disabled = !this.checked;
            this.checked ? (ba.forEach(b => {
                document.querySelector(b).disabled = false;
            }), v.disabled = false, v.checked && (ca.forEach(b => {
                document.querySelector(b).disabled = false;
            }), K.disabled = false)) : (ba.forEach(b => {
                document.querySelector(b).disabled = true;
            }), v.disabled = true, ca.forEach(b => {
                document.querySelector(b).disabled = true;
            }), K.disabled = true);
            chrome.storage.local.set({
                selectquality: this.checked
            });
        });
        ba.forEach(b => {
            b = document.querySelector(b);
            b.value = a[b.id];
            b.disabled = !a.selectquality;
            b.addEventListener("change", saveOptionToLocalStorage);
        });
        v.checked = a.selectqualityfullscreenon;
        v.addEventListener("click", function () {
            ca.forEach(b => {
                document.querySelector(b).disabled = !v.checked;
            });
            K.disabled = !this.checked;
            chrome.storage.local.set({
                selectqualityfullscreenon: this.checked
            });
        });
        ca.forEach(b => {
            b = document.querySelector(b);
            b.value = a[b.id];
            b.disabled = !a.selectqualityfullscreenon;
            b.addEventListener("change", saveOptionToLocalStorage);
        });
        K.checked = a.selectqualityfullscreenoff;
        K.addEventListener("click", saveOptionToLocalStorage);
        btn2 = document.querySelector("#popuplayersize");
        btn2.value = a.popuplayersize;
        btn2.addEventListener("change", saveOptionToLocalStorage);
        var la = document.querySelector("#darktheme"),
            w = document.querySelectorAll('input[name="theme"]'),
            A = document.querySelector("#themevariant"),
            B = document.querySelector("#vendorthemevariant");
        btn = document.querySelector("#customtheme");
        var da = document.querySelector("#customcss");
        u = document.querySelector("#customcss-btn");
        var ea = document.querySelector("#customcss-checkmark");
        btn2 = w.length - 1;
        la.checked = a.darktheme;
        for (la.addEventListener("click", function () {
            w.forEach(b => {
                b.disabled = !la.checked;
            });
            this.checked ? (A.disabled = "enhanced-dark" === document.querySelector('input[name="theme"]:checked').value ? false : true, B.disabled = "youtube-deep-dark" === document.querySelector('input[name="theme"]:checked').value ? false : true, toggleCustomColors()) : (A.disabled = true, B.disabled = true, customColorPickers.forEach(b => {
                b.disabled = true;
            }), ResetCustomColorsButton.disabled = true);
            chrome.storage.local.set({
                darktheme: this.checked
            });
        }); 0 <= btn2; btn2--) w[btn2].value === a.theme && (w[btn2].checked = true), w[btn2].disabled = !a.darktheme, w[btn2].addEventListener("click", saveOptionToLocalStorage), w[btn2].addEventListener("click", function () {
            A.disabled = "enhanced-dark" === this.value ? false : true;
            B.disabled = "youtube-deep-dark" === this.value ? false : true;
            toggleCustomColors();
        });
        A.value = a.themevariant;
        A.disabled = a.darktheme ? "enhanced-dark" === a.theme ? false : true : true;
        A.addEventListener("change", saveOptionToLocalStorage);
        B.value = a.vendorthemevariant;
        B.disabled = a.darktheme ? "youtube-deep-dark" === a.theme ? false : true : true;
        B.addEventListener("change", saveOptionToLocalStorage);
        R = a.customcolors;
        for (btn2 = customColorPickers.length - 1; 0 <= btn2; btn2--) customColorPickers[btn2].disabled = !a.darktheme, customColorPickers[btn2].value = R[customColorPickers[btn2].name], customColorPickers[btn2].addEventListener("change", saveCustomColors);
        ResetCustomColorsButton.disabled = !a.darktheme;
        ResetCustomColorsButton.addEventListener("click", () => {
            var b = Configurations.customcolors;
            customColorPickers.forEach(e => {
                e.value = b[e.name];
            });
            saveCustomColors();
        });
        toggleCustomColors();
        btn.checked = a.customtheme;
        btn.addEventListener("click", function () {
            chrome.storage.local.set({
                customtheme: this.checked
            });
        });
        da.disabled = !a.customtheme;
        da.value = a.customcss;
        da.addEventListener("focus", () => {
            ea.classList.remove("show");
        });
        u.disabled = !a.customtheme;
        u.addEventListener("click", () => {
            ea.classList.add("show");
            chrome.storage.local.set({
                customcss: da.value
            });
        });
        ea.addEventListener("animationend", b => {
            "checkmark-scale" === b.animationName && setTimeout(() => {
                ea.classList.remove("show");
            }, 1200);
        });
        var ma = document.querySelector("#customscript");
        btn2 = document.querySelector("#customscript-btn");
        var fa = document.querySelector("#customscript-checkmark");
        ma.value = a.customscript;
        ma.addEventListener("focus", () => {
            fa.classList.remove("show");
        });
        btn2.addEventListener("click", () => {
            fa.classList.add("show");
            chrome.storage.local.set({
                customscript: ma.value
            });
        });
        fa.addEventListener("animationend", b => {
            "checkmark-scale" === b.animationName && setTimeout(() => {
                fa.classList.remove("show");
            }, 1200);
        });
        btn2 = document.querySelector("#export-modal-btn");
        btn = document.querySelector("#import-modal-btn");
        var backupModal = document.querySelector("#backup-modal"),
            bkpMCloseButton = backupModal.querySelector(".close-modal"),
            bkpMExportContent = backupModal.querySelector("#export-modal-content"),
            bkpMExportTextArea = backupModal.querySelector("#export-textarea"),
            bkpMImportModalContent = backupModal.querySelector("#import-modal-content"),
            bkpMimportError = backupModal.querySelector("#import-error"),
            bkpMimportTextarea = backupModal.querySelector("#import-textarea"),
            bkpMimportButton = backupModal.querySelector("#import-btn"),
            bkpMCopyToClipboardButton = backupModal.querySelector("#copy-to-clipboard-btn"),
            bkpMCopyToClipboardCheckmark = backupModal.querySelector("#copy-to-clipboard-checkmark");
        btn2.addEventListener("click", () => {
            bkpMExportContent.classList.remove("hidden");
            bkpMCopyToClipboardButton.classList.remove("hidden");
            bkpMCopyToClipboardCheckmark.classList.remove("hidden");
            openModal(backupModal);
            chrome.storage.local.get(null, b => {
                var exportPayload = {};
                exportPayload.version = chrome.runtime.getManifest().version;
                exportPayload.settings = {};
                Object.keys(Configurations).forEach(g => {
                    exportPayload.settings[g] = undefined === b[g] ? Configurations[g] : b[g];
                });
                bkpMExportTextArea.value = JSON.stringify(exportPayload, null, 2);
            });
        });
        btn.addEventListener("click", () => {
            bkpMImportModalContent.classList.remove("hidden");
            bkpMimportButton.classList.remove("hidden");
            openModal(backupModal);
        });
        bkpMCloseButton.addEventListener("click", () => {
            closeModal(backupModal);
            setTimeout(() => {
                bkpMExportContent.classList.add("hidden");
                bkpMImportModalContent.classList.add("hidden");
                bkpMimportError.classList.add("hidden");
                bkpMimportButton.classList.add("hidden");
                bkpMCopyToClipboardButton.classList.add("hidden");
                bkpMCopyToClipboardCheckmark.classList.add("hidden");
                bkpMimportTextarea.value = "";
            }, 600);
        });
        bkpMCopyToClipboardButton.addEventListener("click", async () => {
            await navigator.clipboard.writeText(bkpMExportTextArea.value);
            bkpMCopyToClipboardCheckmark.classList.add("show");
        });
        bkpMCopyToClipboardCheckmark.addEventListener("animationend", b => {
            "checkmark-scale" === b.animationName && setTimeout(() => {
                bkpMCopyToClipboardCheckmark.classList.remove("show");
            }, 1200);
        });
        bkpMimportButton.addEventListener("click", async () => {
            var b = bkpMimportTextarea.value.trim();
            if ("" !== b) {
                try {
                    b = JSON.parse(b);
                } catch (g) {
                    bkpMimportError.classList.remove("hidden");
                    bkpMimportTextarea.value = g;
                    return;
                }
                if ("object" === typeof b.settings && b.version && (/^3\.\d+\.\d+/.test(b.version) || /^2\.0\.1(0[2-9]|[1-2][0-9])/.test(b.version))) {
                    Array.isArray(b.settings.controls) && (b.settings.controls = b.settings.controls.filter(x => "whitelist" !== x && "not-interested" !== x));
                    b.settings.backgroundcolor && (b.settings.backdropcolor = b.settings.backgroundcolor, delete b.settings.backgroundcolor);
                    b.settings.backgroundopacity && (b.settings.backdropopacity = b.settings.backgroundopacity, delete b.settings.backgroundopacity);
                    b.settings.customcssrules && (b.settings.customcss = b.settings.customcssrules, delete b.settings.customcssrules);
                    b.settings.miniplayersize && (b.settings.miniplayersize = b.settings.miniplayersize.replace("_", ""));
                    b.settings.miniplayerposition && (b.settings.miniplayerposition = b.settings.miniplayerposition.replace("_", ""));
                    "default-light" === b.settings.theme && (b.settings.theme = "default-dark");
                    let g;
                    if (null == (g = b.settings.themevariant) ? 0 : g.includes("youtube-deep-dark")) b.settings.vendorthemevariant = b.settings.themevariant.replace("-youtube-light", ""), delete b.settings.themevariant;
                    var e = {};
                    Object.keys(b.settings).forEach(x => {
                        typeof Configurations[x] === typeof b.settings[x] && (e[x] = b.settings[x]);
                    });
                    await chrome.storage.local.clear();
                    chrome.storage.local.set(e, () => {
                        mainElement.scrollTo(0, 0);
                        document.location.reload();
                    });
                } else bkpMimportError.classList.remove("hidden"), !b.version || /^3\.\d+\.\d+/.test(b.version) && /^2\.0\.1(0[2-9]|[1-2][0-9])/.test(b.version) || (bkpMimportTextarea.value = "Outdated backup...");
            }
        });
        document.addEventListener("keydown", b => {
            "Escape" === b.key && ("block" === backupModal.style.display ? bkpMCloseButton.click() : "block" === z.style.display && ua.click());
        });
    });

    // OK
    window.addEventListener("resize", applyInsetShadowStyles);
    applyInsetShadowStyles();

    // OK
    document.addEventListener("transitionend", event => {
        const target = event.target;
        if (target === tooltipElement) {
            const rect = tooltipElement.getBoundingClientRect();
            if (rect.left <= 0) {
                tooltipElement.style.setProperty("left", `calc(${rect.width / 2}px + .5rem)`);
            } else if (rect.right > document.documentElement.clientWidth) {
                tooltipElement.style.setProperty("left", `calc(${document.documentElement.clientWidth - rect.width / 2}px - .5rem)`);
            }
        } else if (target.nodeName === "FIELDSET") {
            target.classList.remove("highlighted");
        }
    });
})(document, config);