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
(async config => {
    const { convertshorts: convertShorts } = await chrome.storage.local.get({ convertshorts: config.convertshorts });
    if (convertShorts && /^\/shorts\/[^\/]+/.test(document.location.pathname)) {
        const videoId = document.location.pathname.match(/\/shorts\/([^\/]+)/)[1];
        document.location.replace(`https://www.youtube.com/watch?v=${videoId}`);
    }
})(config);