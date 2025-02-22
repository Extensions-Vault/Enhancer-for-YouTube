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
const config = {
    applyvideofilters: false,
    backdropcolor: "#000000",
    backdropopacity: 85,
    blackbars: false,
    blockautoplay: true,
    blockhfrformats: false,
    blockwebmformats: false,
    boostvolume: false,
    cinemamode: false,
    cinemamodewideplayer: false,
    controlbar: {
        active: true,
        autohide: false,
        centered: true,
        position: "absolute"
    },
    controls: [
        "loop",
        "reverse-playlist",
        "volume-booster",
        "cards-end-screens",
        "cinema-mode",
        "size",
        "pop-up-player",
        "speed",
        "video-filters",
        "screenshot",
        "options"
    ],
    controlsvisible: false,
    controlspeed: true,
    controlspeedmousebutton: false,
    controlvolume: false,
    controlvolumemousebutton: false,
    convertshorts: false,
    customcolors: {
        "--main-color": "#ff0033",
        "--main-background": "#111111",
        "--second-background": "#181818",
        "--hover-background": "#232323",
        "--main-text": "#eff0f1",
        "--dimmer-text": "#cccccc",
        "--shadow": "#000000"
    },
    customcss: "",
    customscript: "",
    customtheme: false,
    darktheme: false,
    date: 0,
    defaultvolume: false,
    disableautoplay: false,
    executescript: false,
    expanddescription: false,
    filter: "none",
    hidecardsendscreens: false,
    hidechat: false,
    hidecomments: false,
    hiderelated: false,
    hideshorts: false,
    ignoreplaylists: true,
    ignorepopupplayer: true,
    localecode: "en_US",
    localedir: "ltr",
    miniplayer: true,
    miniplayerposition: "top-left",
    miniplayersize: "480x270",
    newestcomments: false,
    overridespeeds: true,
    pauseforegroundtab: false,
    pausevideos: true,
    popuplayersize: "640x360",
    previousversion: "0.0.0",
    qualityembeds: "medium",
    qualityembedsfullscreen: "hd1080",
    qualityplaylists: "hd720",
    qualityplaylistsfullscreen: "hd1080",
    qualityvideos: "hd720",
    qualityvideosfullscreen: "hd1080",
    reload: false,
    reversemousewheeldirection: false,
    selectquality: false,
    selectqualityfullscreenoff: false,
    selectqualityfullscreenon: false,
    speed: 1,
    speedvariation: 0.02,
    stopvideos: false,
    theatermode: false,
    theme: "enhanced-dark",
    themevariant: "dark-red.css",
    update: 0,
    vendorthemevariant: "youtube-deep-dark.css",
    videofilters: {
        blur: 0,
        brightness: 100,
        contrast: 100,
        grayscale: 0,
        rotation: 0,
        inversion: 0,
        saturation: 100,
        sepia: 0
    },
    volume: 50,
    volumemultiplier: 2,
    volumevariation: 5,
    whatsnew: false,
    wideplayer: false,
    wideplayerviewport: false
};

const configEmbed = {
    blockhfrformats: config.blockhfrformats,
    blockwebmformats: config.blockwebmformats,
    controls: config.controls,
    controlspeed: config.controlspeed,
    controlspeedmousebutton: config.controlspeedmousebutton,
    controlvolume: config.controlvolume,
    controlvolumemousebutton: config.controlvolumemousebutton,
    defaultvolume: config.defaultvolume,
    ignorepopupplayer: config.ignorepopupplayer,
    overridespeeds: config.overridespeeds,
    pausevideos: config.pausevideos,
    qualityembeds: config.qualityembeds,
    qualityembedsfullscreen: config.qualityembedsfullscreen,
    reversemousewheeldirection: config.reversemousewheeldirection,
    selectquality: config.selectquality,
    selectqualityfullscreenoff: config.selectqualityfullscreenoff,
    selectqualityfullscreenon: config.selectqualityfullscreenon,
    speed: config.speed,
    speedvariation: config.speedvariation,
    volume: config.volume,
    volumemultiplier: config.volumemultiplier,
    volumevariation: config.volumevariation
};

const configLiveChat = {
    customcolors: config.customcolors,
    customcss: config.customcss,
    customtheme: config.customtheme,
    darktheme: config.darktheme,
    theme: config.theme,
    themevariant: config.themevariant,
    vendorthemevariant: config.vendorthemevariant
};