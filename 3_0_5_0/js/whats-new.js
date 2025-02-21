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
(document => {
    chrome.storage.local.get({
        localecode: chrome.i18n.getMessage("locale_code")
    }, ({ localecode }) => {
        const currency = ["bg", "ca", "cs", "da", "de", "el", "es", "et", "fi", "fr", "hr", "hu", "it", "lt", "lv", "nl", "pl", "pt_PT", "ro", "sk", "sl", "sv"].includes(localecode) ? "EUR" : "USD";
        const thanksButtons = document.querySelector(".thanks-buttons");
        thanksButtons.classList.add(currency);
        thanksButtons.querySelectorAll("button").forEach(button => {
            button.addEventListener("click", () => {
                chrome.tabs.create({
                    url: `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=JYKCHGNJ6PFC4&item_name=Enhancer%20for%20YouTube%E2%84%A2%20%5BChrome%20Extension%5D&no_note=1&no_shipping=1&rm=1&return=https%3A%2F%2Fwww.mrfdev.com%2Fthanks&cancel_return=https%3A%2F%2Fwww.mrfdev.com%2Fdonate&amount=${button.dataset.amount}&currency_code=${currency}`,
                    active: true
                });
            });
        });
    });
})(document);