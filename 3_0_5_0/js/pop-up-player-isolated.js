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
(() => {
    document.title = "Enhancer for YouTube™";
    const videoId = document.location.href.split("/pop-up-player/")[1];
    const iframe = createIframe(videoId);
    document.body.appendChild(iframe);
})();

function createIframe(videoId) {
    const iframe = document.createElement("iframe");
    iframe.id = "pop-up-player";
    iframe.allow = "accelerometer;autoplay;encrypted-media;gyroscope;picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.addEventListener("DOMContentLoaded", updateDocumentTitle);
    iframe.addEventListener("load", handleIframeLoad, { once: true });
    return iframe;
}

function updateDocumentTitle() {
    document.title = this.contentDocument.title;
}

async function handleIframeLoad() {
    const { playlist } = await chrome.storage.local.get({ playlist: {} });
    if (Object.keys(playlist).length > 0) {
        this.contentDocument.defaultView.document.dispatchEvent(new CustomEvent("efyt-pop-up-player-message", {
            detail: {
                message: "load-playlist",
                playlist
            }
        }));
        chrome.storage.local.remove("playlist");
    }
}