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
    const body = document.body;
    const modalBackdrop = document.querySelector("#modal-backdrop");
    const donateModal = document.querySelector("#donate-modal");
    const i18nModal = document.querySelector("#i18n-modal");
    const generateCodeBtn = document.querySelector("#generate-code-btn");
    const localeSelect = document.querySelector("#locale");
    const contentEditableElements = document.querySelectorAll("[contenteditable]");
    const description = document.querySelector("#description");
    const copyToClipboardBtn = document.querySelector("#copy-to-clipboard-btn");
    const copyToClipboardCheckmark = document.querySelector("#copy-to-clipboard-checkmark");
    const donateLink = document.querySelector("nav .donate a");
    const donateButtons = donateModal.querySelectorAll(".donate-buttons button");
    const closeModalButtons = document.querySelectorAll(".close-modal");
    const modalTitle = i18nModal.querySelector(".modal-title");
    const codeTextarea = i18nModal.querySelector("#code");

    const rtlLocales = ["am", "bn", "fil", "gu", "kn", "ml", "mr", "sw", "ta", "te"];
    const specialCases = {
        ca: ["color", "contrast", "controls", "sepia", "videos"],
        cs: ["stop"],
        da: ["backup", "hue_rotation", "loop", "loop_start", "stop", "support", "sepia", "variant"],
        de: ["autoplay", "backup", "export", "import", "loop_start", "playlists", "screenshot", "sepia", "stop", "videos"],
        el: ["theme"],
        es: ["color", "sepia"],
        es_419: ["color", "sepia", "videos"],
        et: ["variant"],
        fr: ["options", "support", "volume", "stop", "message"],
        hr: ["autoplay", "mini_player", "save", "video_player"],
        id: ["autoplay", "backup", "gaussian_blur", "reset", "screenshot", "sepia", "stop", "volume"],
        it: ["backup", "loop", "mini_player", "mouse", "playlists", "reset", "screenshot", "sepia", "volume"],
        ms: ["import", "sepia"],
        nl: ["autoplay", "filters", "support", "contrast", "sepia", "variant", "volume"],
        no: ["loop_start", "sepia", "variant"],
        pl: ["sepia"],
        pt_BR: ["backup", "loop", "mini_player", "mouse", "playlists", "volume"],
        pt_PT: ["backup", "volume"],
        ro: ["backup", "gaussian_blur", "contrast", "mouse", "sepia"],
        sk: ["message"],
        sl: ["sepia"],
        sr: ["sepia"],
        sv: ["loop", "support", "sepia", "variant"],
        vi: ["videos"]
    };

    function showModal(modal) {
        body.classList.add("overflow-hidden");
        modalBackdrop.style.display = "block";
        modal.style.display = "block";
        modal.scrollTop = 0;
        modalBackdrop.classList.add("in");
        setTimeout(() => {
            body.classList.add("modal-open");
            modal.querySelector("button.close-modal").focus();
        }, 50);
    }

    function hideModal(modal) {
        body.classList.remove("modal-open");
        setTimeout(() => {
            modal.style.display = "none";
            modalBackdrop.classList.add("fade");
            modalBackdrop.classList.remove("in");
            setTimeout(() => {
                modalBackdrop.style.display = "none";
                body.classList.remove("overflow-hidden");
                if (modal.id === "donate-modal") {
                    document.querySelector("nav .donate a").focus();
                } else if (modal.id === "i18n-modal") {
                    generateCodeBtn.focus();
                }
            }, 300);
        }, 300);
    }

    function updateMainInsetShadow() {
        const main = document.querySelector("main");
        const style = document.createElement("style");
        style.textContent = `:root{--main-inset-shadow-top:${main.offsetTop}px;--main-inset-shadow-width:${main.clientWidth}px}`;
        document.head.appendChild(style);
    }

    function handleLocaleChange() {
        const selectedOption = localeSelect.options[localeSelect.selectedIndex];
        const dir = selectedOption.dataset.dir;
        const locale = selectedOption.value;
        const localeName = selectedOption.textContent;

        if (!locale || rtlLocales.includes(locale)) {
            contentEditableElements.forEach(el => {
                el.textContent = "";
                el.dir = "ltr";
            });
            generateCodeBtn.disabled = !locale;
        } else {
            fetch(chrome.runtime.getURL(`_locales/${locale}/messages.json`))
                .then(response => response.json())
                .then(messages => {
                    contentEditableElements.forEach(el => {
                        const message = messages[el.id].message;
                        if (["en_US", "en_GB"].includes(messages.locale_code.message) || message !== el.previousElementSibling.innerText || (specialCases[messages.locale_code.message] && specialCases[messages.locale_code.message].includes(el.id))) {
                            el.innerText = message;
                        } else {
                            el.textContent = "";
                        }
                        el.dir = dir;
                    });
                    generateCodeBtn.disabled = false;
                });
        }
    }

    function handleDescriptionKeyup() {
        if (description.textContent.length > 132) {
            description.textContent = description.textContent.substr(0, 132);
            description.blur();
        }
    }

    function handleGenerateCodeClick() {
        const locale = localeSelect.value;
        if (!locale) return;

        const translation = {
            locale_code: { message: locale },
            locale_dir: { message: localeSelect.options[localeSelect.selectedIndex].dataset.dir }
        };

        contentEditableElements.forEach(el => {
            const message = el.innerText.trim() || el.previousElementSibling.innerText;
            translation[el.id] = { message };
        });

        modalTitle.textContent = `${localeSelect.options[localeSelect.selectedIndex].textContent} Translation - Enhancer for YouTube™`;
        codeTextarea.value = JSON.stringify(translation, null, 4);
        showModal(i18nModal);
    }

    function handleDonateClick(event) {
        event.preventDefault();
        chrome.storage.local.get({ localecode: chrome.i18n.getMessage("locale_code") }, ({ localecode }) => {
            const currencyCode = ["bg", "ca", "cs", "da", "de", "el", "es", "et", "fi", "fr", "hr", "hu", "it", "lt", "lv", "nl", "pl", "pt_PT", "ro", "sk", "sl", "sv"].includes(localecode) ? "EUR" : "USD";
            donateModal.querySelector(".donate-buttons").dataset.currencyCode = currencyCode;
            showModal(donateModal);
        });
    }

    function handleDonateButtonClick(event) {
        const amount = event.currentTarget.dataset.amount;
        chrome.storage.local.get({ localecode: chrome.i18n.getMessage("locale_code") }, ({ localecode }) => {
            const currencyCode = ["bg", "ca", "cs", "da", "de", "el", "es", "et", "fi", "fr", "hr", "hu", "it", "lt", "lv", "nl", "pl", "pt_PT", "ro", "sk", "sl", "sv"].includes(localecode) ? "EUR" : "USD";
            const url = donateLink.dataset.paypal.replace(/AMOUNT/, amount).replace(/CURRENCY_CODE/, currencyCode);
            chrome.tabs.create({ url, active: true });
        });
    }

    function handleCopyToClipboardClick() {
        navigator.clipboard.writeText(codeTextarea.value).then(() => {
            copyToClipboardCheckmark.classList.add("show");
        });
    }

    function handleCheckmarkAnimationEnd(event) {
        if (event.animationName === "checkmark-scale") {
            setTimeout(() => {
                copyToClipboardCheckmark.classList.remove("show");
            }, 1200);
        }
    }

    function handleKeydown(event) {
        if (event.key === "Escape") {
            closeModalButtons.forEach(button => button.click());
        }
    }

    localeSelect.addEventListener("change", handleLocaleChange);
    description.addEventListener("keyup", handleDescriptionKeyup);
    generateCodeBtn.addEventListener("click", handleGenerateCodeClick);
    donateLink.addEventListener("click", handleDonateClick);
    donateButtons.forEach(button => button.addEventListener("click", handleDonateButtonClick));
    closeModalButtons.forEach(button => button.addEventListener("click", () => hideModal(button.closest(".modal"))));
    copyToClipboardBtn.addEventListener("click", handleCopyToClipboardClick);
    copyToClipboardCheckmark.addEventListener("animationend", handleCheckmarkAnimationEnd);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", updateMainInsetShadow);

    updateMainInsetShadow();
})(document);