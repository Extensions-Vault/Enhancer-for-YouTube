console.log("Enhancer for YouTube™ deobfuscated");
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
((_window, _document) => {

  // OK
  function updatePlaybackSettings(a) {
    if (!a) moviePlayer.enhance = undefined;

    const videoData = moviePlayer?.getVideoData?.();
    if (videoData?.isLive) {
      currentPlaybackRate = 1;
      if (moviePlayer.efytRestorePlaybackRate) moviePlayer.efytCurrentPlaybackRate = 1;
    }

    if (videoObject && settings.overridespeeds) {
      videoObject.playbackRate = currentPlaybackRate;
      videoObject.defaultPlaybackRate = currentPlaybackRate;
    } else {
      moviePlayer.setPlaybackRate?.(currentPlaybackRate);
    }

    moviePlayer.efytPlaybackRate = currentPlaybackRate;

    if (settings.selectquality) setVideoPlaybackQuality();
    if (settings.defaultvolume && !isPlayerUnstarted) {
      moviePlayer.efytVolume ||= settings.volume;
      moviePlayer.setVolume(moviePlayer.efytVolume);
    }

    if (settings.boostvolume && (!gainControl || gainControl.gain.value === 1)) {
      userInstance ? onClickVolumeBooster() : configureAudioGain();
    }

    if (videoObject && settings.applyvideofilters) videoObject.style.filter = settings.filter;
    if (settings.hidecardsendscreens) disableAnnotationsModule();
    if (settings.blackbars) moviePlayer.classList.add("efyt-black-bars");

    if (settings.disableautoplay) {
      toggleAutoplay(true);
      setTimeout(() => {
        toggleAutoplay(true);
        try {
          _window.sessionStorage["yt-player-autonavstate"] = JSON.stringify({
            data: "1",
            creation: Date.now()
          });
        } catch (l) { }
      }, 2000);
    }

    playbackControls = true;
  }

  // OK
  function registerYtActionsHandlers() {
    ytdApp = _document.querySelector("ytd-app");
    if (!ytdApp) return;

    ytdApp.addEventListener("yt-action", (event) => {
      const { actionName, args } = event.detail;

      switch (actionName) {
        case "yt-user-activity":
        case "yt-window-scrolled":
          controlsBarFlag && updateControlsBar();
          playbackControls && updatePlaybackControls();
          if (settings?.hidechat && videoPlaybackManager?.theater && videoPlaybackManager.hasAttribute("fixed-panels") && videoPlaybackManager.hasAttribute("watch-while-panels-active")) {
            const chatFrame = videoPlaybackManager.querySelector("ytd-live-chat-frame#chat");
            chatFrame?.onShowHideChat?.call(chatFrame);
          }
          break;

        case "yt-window-resized":
          if (!rb && _document.body.classList.contains("efyt-viewport") && !_document.body.classList.contains("efyt-mini-player")) {
            ctxPlayerSize({ preventDefault: () => { }, stopPropagation: () => { } });
          }
          rb = false;
          break;

        case "yt-toggle-theater-mode":
          if (videoPlaybackManager.playerUnavailable && !videoPlaybackManager.theater) {
            let errorScreen = videoPlaybackManager.querySelector("yt-playability-error-supported-renderers#error-screen");
            while (errorScreen && errorScreen.parentNode.id !== "player") {
              errorScreen.parentNode.parentNode.appendChild(errorScreen);
            }
          }
          break;

        case "yt-fullscreen-change-action":
          if ((args[0] && settings.selectquality && settings.selectqualityfullscreenon) || (!args[0] && settings.selectquality && settings.selectqualityfullscreenoff)) {
            setVideoPlaybackQuality();
          }
          if (!args[0] && _document.body.classList.contains("efyt-viewport")) {
            ctxPlayerSize({ preventDefault: () => { }, stopPropagation: () => { } });
          }
          if (isVideoAvailable && settings.controlbar.active) {
            if (moviePlayer && settings.controlbar.position === "fixed") {
              if (args[0]) {
                moviePlayer.querySelector(".ytp-chrome-controls")?.appendChild(userInstance);
                ytdControlTooltip.classList.add("ytp-tooltip");
              } else {
                moviePlayer.appendChild(userInstance);
                ytdControlTooltip.classList.remove("ytp-tooltip");
              }
            } else if (videoPlaybackController && settings.controlbar.position === "absolute") {
              videoPlaybackController.classList.toggle("efyt-control-bar-centered", args[0]);
            }
          }
          setTimeout(() => {
            if (_document.body.classList.contains("efyt-wide-player")) {
              _window.dispatchEvent(new Event("resize"));
            }
            PlaybackRateText.style.display = "none";
            hideTooltip();
          }, 500);
          break;

        case "yt-end-playlist-command":
        case "yt-playlist-remove-videos-action":
        case "yt-recover-playlist-command":
        case "yt-refresh-playlist-command":
        case "yt-update-playlist-action":
          toggleReversePlaylistControl();
          break;

        case "yt-activate-miniplayer-from-watch-action":
          if ((ytdApp.fullscreen_ || ytdApp.fullscreen) && userInstance && settings.controlbar.active) {
            if (moviePlayer && settings.controlbar.position === "fixed") {
              moviePlayer.appendChild(userInstance);
              ytdControlTooltip.classList.remove("ytp-tooltip");
            } else if (videoPlaybackController && settings.controlbar.position === "absolute") {
              videoPlaybackController.classList.remove("efyt-control-bar-centered");
            }
          }
          break;

        case "yt-signal-action-toggle-dark-theme-off":
        case "yt-signal-action-toggle-dark-theme-device":
          _document.dispatchEvent(new CustomEvent("efyt-message", {
            detail: { request: "dark-theme-off" }
          }));
          break;
      }
    });
  }

  // OK
  function initializeVideoPlaybackManager() {
    let tmp;
    videoPlaybackManager = ytdApp?.querySelector("ytd-watch-flexy, ytd-watch-grid");
    if (videoPlaybackManager) {
      const originalVideoHeightToWidthRatioChanged = videoPlaybackManager.videoHeightToWidthRatioChanged_;
      if (originalVideoHeightToWidthRatioChanged) {
        videoPlaybackManager.videoHeightToWidthRatioChanged_ = function (...args) {
          const result = originalVideoHeightToWidthRatioChanged.apply(this, args);
          if (moviePlayer?.getVideoAspectRatio) {
            g_videoAspectRatio = moviePlayer.getVideoAspectRatio();
            scr_Width = scr_Height = undefined;
            handleWindowResize();
            handleMiniplayer();
          }
          return result;
        };
      }

      const originalVideoHeightToWidthRatioChangedAlt = videoPlaybackManager.videoHeightToWidthRatioChanged;
      if (originalVideoHeightToWidthRatioChangedAlt) {
        videoPlaybackManager.videoHeightToWidthRatioChanged = function (...args) {
          const result = originalVideoHeightToWidthRatioChangedAlt.apply(this, args);
          if (moviePlayer?.getVideoAspectRatio) {
            g_videoAspectRatio = moviePlayer.getVideoAspectRatio();
            scr_Width = scr_Height = undefined;
            handleWindowResize();
            handleMiniplayer();
          }
          return result;
        };
      }
    }
  }

  // OK
  function initializePlaylistManager() {
    const playlistManager = ytdApp?.querySelector("yt-playlist-manager");
    if (playlistManager) {
      Ga = playlistManager;
      Ga.addEventListener("yt-playlist-data-updated", toggleReversePlaylistControl);
    }
  }

  // OK
  function bindTheaterModeToggle() {
    ytHotkeyManager = ytdApp?.querySelector("yt-hotkey-manager");
    ytHotkeyManager?.addEventListener("yt-action", (event) => {
      if (event.detail.actionName === "yt-toggle-theater-mode" && _document.body.classList.contains("efyt-wide-player")) {
        resetPlayerView();
      }
    });
  }

  // OK
  function initializeWatchMetadata() {
    watchMetadataElement = ytdApp?.querySelector("ytd-watch-metadata");
    watchMetadataElement?.addEventListener("click", executeSeekOnLink, true);
  }

  // OK
  function initializeCommentListener() {
    const tmp = ytdApp?.querySelector("ytd-comments#comments");
    if (tmp) {
      ytdComments = tmp;
      SetEventActionListener("add");
      ytdComments.addEventListener("click", executeSeekOnLink, true);
    }
  }

  // OK
  function SetEventActionListener(a) {
    ytdComments[a + "EventListener"]("yt-action", handleYoutubeServiceRequest);
  }

  // OK
  function handleYoutubeServiceRequest(a) {
    "yt-service-request" === a.detail.actionName && settings.newestcomments && setTimeout(sortCommentsClick, 1e3);
  }

  // OK
  function determineYoutubePath() {
    // "watch" FOR
    // Paths that start with "/v", "/clip", or "/live".
    // URLs that contain "/playlist?list=" followed by any characters and then "playnext=".

    // "channel" FOR
    // Paths that start with "/@", "/user/", "/channel/", or "/c/".
    "/watch" === _document.location.pathname || /^\/(v|clip|live)\//.test(_document.location.pathname) || /\/playlist\?list=.+playnext=/.test(_document.location.href) ? ytUrlClassification = "watch" : /^\/(@|user\/|channel\/|c\/)/.test(_document.location.pathname) && (ytUrlClassification = "channel");
    return ytUrlClassification;
  }

  // OK
  function initializeVideoClickHandler() {
    videoObject = _document.querySelector("#movie_player.html5-video-player video.html5-main-video");
    if (videoObject) {
      videoObject.addEventListener("click", handlePlaybackSpeed);
    }
  }

  // OK
  function initializeMoviePlayer() {
    moviePlayer = _document.querySelector("#movie_player.html5-video-player");
    if (moviePlayer) {
      isVideoAvailable = determineYoutubePath() === "watch";
      handleWindowResize();
      if (settings.blockautoplay && (ka || settings.pauseforegroundtab)) {
        moviePlayer.efytAddListeners = true;
        moviePlayer.enhance = true;
      } else {
        if (isVideoAvailable) {
          moviePlayer.enhance = true;
        }
        initializePlayerEventListeners();
      }
      updatePlaybackControls();
    }
  }

  // OK
  function initializePlayerEventListeners() {
    moviePlayer.addEventListener("onStateChange", onStateChangeImpl);
    moviePlayer.addEventListener("onAdStateChange", onAdStateChangeImpl);
    moviePlayer.addEventListener("onPlaybackRateChange", onPlaybackRateChangeImpl);
    moviePlayer.addEventListener("SIZE_CLICKED", onResetPlayerViewIfWide);
  }

  // OK
  function initializePlayerEvents() {
    if (videoPlaybackController = _document.querySelector("#player-container.ytd-watch-flexy, #player-container.ytd-watch-grid")) {
      var isWindowsUser = userAgentString.includes("Windows");
      videoPlaybackController.addEventListener("mouseenter", onMouseEnter);
      videoPlaybackController.addEventListener("mouseleave", onMouseLeave);
      videoPlaybackController.addEventListener("mousedown", onMouseDownHandler, true);
      videoPlaybackController.addEventListener("mouseup", isWindowsUser ? onMouseUpWin : onMouseUpOther, true);
      videoPlaybackController.addEventListener("contextmenu", isWindowsUser ? onCtxWin : onCtxOther, true);
      videoPlaybackController.addEventListener("wheel", handleVolumeChange);
      settings.miniplayer && (initializeObserver(), _document.body.classList.add("efyt-mini-player-" + settings.miniplayersize, "efyt-mini-player-" + settings.miniplayerposition));
    }
  }

  // OK
  function initializeObserver() {
    if (!videoPlaybackController.efytObserver) {
      videoPlaybackController.efytObserver = new IntersectionObserver(entries => {
        const entry = entries[0];
        const isVideoPlaying = moviePlayer && !moviePlayer.classList.contains("ended-mode");
        const shouldEnableMiniPlayer = (entry.intersectionRatio === 0 && !_document.body.classList.contains("efyt-mini-player") && _window.scrollY > 0) ||
          (entry.intersectionRatio > 0 && entry.intersectionRatio < 0.12 && _window.scrollY > videoPlaybackController.offsetHeight - 100);

        if (shouldEnableMiniPlayer && isVideoAvailable && isVideoPlaying) {
          if (videoObject) {
            videoObject.addEventListener("timeupdate", updateVideoProgress);
            updateVideoProgress();
          }
          _document.body.classList.add("efyt-mini-player");
          _window.dispatchEvent(new Event("resize"));
        } else if (entry.intersectionRatio !== 0) {
          if (videoObject) {
            videoObject.removeEventListener("timeupdate", updateVideoProgress);
          }
          _document.body.classList.remove("efyt-mini-player");
          rb = true;
          _window.dispatchEvent(new Event("resize"));
        }
      }, {
        threshold: 0.12
      });
      videoPlaybackController.efytObserver.observe(videoPlaybackController);
    }
  }

  // OK
  function setThemeStylesheet() {
    if (settings.darktheme && "default-dark" !== settings.theme) {
      if ("enhanced-dark" === settings.theme || "youtube-deep-dark" === settings.theme) {
        var stylesheetLink = _document.createElement("link");
        stylesheetLink.id = "efyt-dark-theme-colors";
        stylesheetLink.rel = "stylesheet";
        stylesheetLink.href = "enhanced-dark" === settings.theme ? Ka + settings.themevariant : La + settings.vendorthemevariant;
      } else "youtube-deep-dark-custom" === settings.theme && (stylesheetLink = _document.createElement("style"), stylesheetLink.id = "efyt-dark-theme-colors", stylesheetLink.textContent = generateCSSCustomColors());
      _document.head ? _document.head.appendChild(stylesheetLink) : _document.documentElement.addEventListener("load", function e() {
        _document.head && (_document.documentElement.removeEventListener("load", e, true), _document.head.appendChild(stylesheetLink));
      }, true);
    }
  }

  // OK
  function removeDarkThemeColors() {
    var darkThemeColorsElement = _document.head.querySelector("#efyt-dark-theme-colors");
    darkThemeColorsElement && _document.head.removeChild(darkThemeColorsElement);
  }

  // OK
  function applyDarkThemeStyles() {
    if (settings.darktheme && "default-dark" !== settings.theme) {
      var stylesheetLink = _document.createElement("link");
      stylesheetLink.id = "efyt-dark-theme";
      stylesheetLink.rel = "stylesheet";
      stylesheetLink.href = ("enhanced-dark" === settings.theme ? Ka + "main.css?v=" : La + "youtube-deep-dark.material.css?v=") + themeVersion;
      _document.head ? _document.head.appendChild(stylesheetLink) : _document.documentElement.addEventListener("load", function e() {
        _document.head && (_document.documentElement.removeEventListener("load", e, true), _document.head.appendChild(stylesheetLink));
      }, true);
    }
  }

  // OK
  function cleanupDarkThemeReferences() {
    var darkThemeElement = _document.head.querySelector("#efyt-dark-theme"),
      darkThemeColorsElement = _document.head.querySelector("#efyt-dark-theme-colors");
    darkThemeElement && _document.head.removeChild(darkThemeElement);
    darkThemeColorsElement && _document.head.removeChild(darkThemeColorsElement);
  }

  // OK
  function applyCustomTheme() {
    if (settings.customtheme) {
      var customThemeStyleElement = _document.createElement("style");
      customThemeStyleElement.id = "efyt-custom-theme";
      customThemeStyleElement.textContent = settings.customcss;
      _document.head ? _document.head.appendChild(customThemeStyleElement) : _document.documentElement.addEventListener("load", function e() {
        _document.head && (_document.documentElement.removeEventListener("load", e, true), _document.head.appendChild(customThemeStyleElement));
      }, true);
    }
  }

  // OK
  function $setCustomTheme(a) {
    var customThemeElement = _document.head.querySelector("#efyt-custom-theme");
    customThemeElement && (customThemeElement.textContent = a, _document.head.appendChild(customThemeElement));
  }

  // OK
  function applyDarkThemeColors() {
    var a = _document.head.querySelector("#efyt-dark-theme-colors");
    a && (a.textContent = generateCSSCustomColors());
  }

  // OK
  function generateCSSCustomColors() {
    return `:root{${Object.entries(settings.customcolors).map(([key, value]) => {
      if (key === "--shadow") {
        const [r, g, b] = [value.slice(1, 3), value.slice(3, 5), value.slice(5, 7)].map(hex => parseInt(hex, 16));
        value = `0 1px .5px rgba(${r}, ${g}, ${b}, .2)`;
      }
      return `${key}:${value}`;
    }).join(";")}}`;
  }

  // OK
  function $executeScriptIfEnabled() {
    settings && settings.executescript && onClickCustomScript();
  }

  // OK
  function onClickCustomScript() {
    var a = _document.createElement("script");
    a.textContent = securityPolicy.createScript(settings.customscript);
    _document.head.appendChild(a);
  }

  // OK
  function enableDarkTheme() {
    let a, b;
    null == (a = ytdApp) || null == (b = a.handleSignalActionToggleDarkThemeOn) || b.call(a);
  }

  // OK
  function disableDarkTheme() {
    let a, b;
    null == (a = ytdApp) || null == (b = a.handleSignalActionToggleDarkThemeOff) || b.call(a);
  }

  // OK
  function applyDarkThemeIfEnabled() {
    settings.darktheme && !_document.documentElement.hasAttribute("dark") && enableDarkTheme();
  }

  // OK
  function applyStylesForCinemaMode() {
    const styleElement = _document.createElement("style");
    let styles = `efyt-backdrop{background:${settings.backdropcolor}}body.efyt-cinema-mode efyt-backdrop{opacity:${settings.backdropopacity / 100};visibility:visible}`;

    if (userAgentString.includes("Chrome") && !userAgentString.includes("Edg")) {
      styles += "#movie_player:not(.ytp-fullscreen) div.ytp-chrome-controls button.ytp-pip-button.ytp-button{display:inline-block !important; transform:scaleY(-1)}";
    }

    styleElement.textContent = styles;
    _document.head.appendChild(styleElement);
  }

  // OK
  function handleMiniplayer() {
    var miniplayerDimensions = settings.miniplayersize.split("x"),
      styleElement = _document.createElement("style");
    styleElement.textContent = `
:root {
  --efyt-mini-player-aspect-ratio: ${g_videoAspectRatio};
  --efyt-mini-player-height: ${miniplayerDimensions[1]}px;
  --efyt-mini-player-width: ${miniplayerDimensions[0]}px;
  --efyt-mini-player-center-left: calc(100vw / 2 - ${miniplayerDimensions[0] / 2}px);
  --efyt-mini-player-caption-window-left: calc(var(--efyt-mini-player-width) * 1 / 10);
  --efyt-mini-player-caption-window-width: calc(var(--efyt-mini-player-width) * 8 / 10);
  --efyt-mini-player-short-width: calc(var(--efyt-mini-player-height) * var(--efyt-mini-player-aspect-ratio));
  --efyt-mini-player-short-left: calc(calc(var(--efyt-mini-player-width) - calc(var(--efyt-mini-player-height) * var(--efyt-mini-player-aspect-ratio))) / 2);
}

body.efyt-mini-player #movie_player:not(.ytp-fullscreen),
body.efyt-mini-player #movie_player:not(.ytp-fullscreen) video.html5-main-video,
body.efyt-wide-player.efyt-mini-player ytd-watch-flexy[theater] #movie_player:not(.ytp-fullscreen) video.html5-main-video {
  height: auto !important;
  width: var(--efyt-mini-player-width) !important;
  aspect-ratio: ${g_videoAspectRatio} !important;
}

body.efyt-mini-player #movie_player:not(.ytp-fullscreen) .ytp-caption-window-container > div.caption-window {
  left: var(--efyt-mini-player-caption-window-left) !important;
  width: var(--efyt-mini-player-caption-window-width) !important;
}

body.efyt-mini-player.efyt-short #movie_player:not(.ytp-fullscreen) {
  height: var(--efyt-mini-player-height) !important;
  aspect-ratio: auto !important;
}

body.efyt-mini-player.efyt-short #movie_player:not(.ytp-fullscreen) video.html5-main-video,
body.efyt-wide-player.efyt-mini-player.efyt-short ytd-watch-flexy[theater] #movie_player:not(.ytp-fullscreen) video.html5-main-video {
  width: var(--efyt-mini-player-short-width) !important;
  left: var(--efyt-mini-player-short-left) !important;
  aspect-ratio: auto !important;
}
`;
    _document.head.appendChild(styleElement);
  }

  // OK
  function applyBackdropColorAndOpacity() {
    const hexColor = settings.backdropcolor.replace("#", "");
    const red = parseInt(hexColor.substring(0, 2), 16);
    const green = parseInt(hexColor.substring(2, 4), 16);
    const blue = parseInt(hexColor.substring(4, 6), 16);
    const opacity = settings.backdropopacity / 100;
    const styleElement = _document.createElement("style");
    styleElement.textContent = `body.efyt-cinema-mode .html5-video-player:not(.efyt-black-bars){background: rgba(${red}, ${green}, ${blue}, ${opacity})}`;
    _document.head.appendChild(styleElement);
  }

  // OK
  function updatePlaybackControls() {
    if ("watch" === determineYoutubePath() && moviePlayer && PlaybackRateText)
      if (moviePlayer.contains(PlaybackRateText)) playbackControls = undefined;
      else {
        var fragment = _document.createDocumentFragment();
        fragment.appendChild(PlaybackRateText);
        fragment.appendChild(ctrl_progress);
        fragment.appendChild(ctrl_progress_tooltip);
        fragment.appendChild(ctrl_progress_hideMiniPlayer);
        moviePlayer.appendChild(fragment);
      }
  }

  // OK
  function initializePlaybackUI() {
    PlaybackRateText = _document.createElement("efyt-bezel");
    backdropElement = _document.createElement("efyt-backdrop");
    backdropElement.classList.add("no-transition");
    backdropElement.addEventListener("click", exitCinemaMode);
    _document.body.appendChild(backdropElement);

    ctrl_progress = _document.createElement("progress");
    ctrl_progress.id = "efyt-progress";
    ctrl_progress.max = 1;
    ctrl_progress.value = 0;
    ctrl_progress.addEventListener("click", function (e) {
      if (videoObject) {
        videoObject.currentTime = Math.floor(e.offsetX * this.max / this.clientWidth);
        focusMoviePlayer();
      }
    });
    ctrl_progress.addEventListener("mouseenter", () => {
      ctrl_progress_tooltip.classList.add("visible");
    });
    ctrl_progress.addEventListener("mouseleave", () => {
      ctrl_progress_tooltip.classList.remove("visible");
    });
    ctrl_progress.addEventListener("mousemove", function (e) {
      if (videoObject) {
        const time = Math.floor(e.offsetX * this.max / this.clientWidth);
        const { h, m, s } = durationInSecondsToHMS(time);
        ctrl_progress_tooltip.textContent = `${h > 0 ? h + ":" : ""}${m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:"}${s < 10 ? "0" : ""}${s}`;
        const tooltipWidth = ctrl_progress_tooltip.clientWidth;
        const halfTooltipWidth = tooltipWidth / 2;
        ctrl_progress_tooltip.style.left = `${Math.min(Math.max(e.offsetX - halfTooltipWidth, 0), this.clientWidth - tooltipWidth)}px`;
      }
    });

    ctrl_progress_tooltip = _document.createElement("efyt-progress-tooltip");
    ctrl_progress_hideMiniPlayer = _document.createElement("efyt-hide-mini-player");
    const svg = _document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = _document.createElementNS("http://www.w3.org/2000/svg", "path");
    svg.setAttributeNS(null, "version", "1.1");
    svg.setAttributeNS(null, "viewBox", "0 0 24 24");
    svg.setAttributeNS(null, "height", "100%");
    svg.setAttributeNS(null, "width", "100%");
    path.setAttributeNS(null, "d", "M 12,2 C 6.47,2 2,6.47 2,12 2,17.53 6.47,22 12,22 17.53,22 22,17.53 22,12 22,6.47 17.53,2 12,2 Z M 17,15.59 15.59,17 12,13.41 8.41,17 7,15.59 10.59,12 7,8.41 8.41,7 12,10.59 15.59,7 17,8.41 13.41,12 Z");
    svg.appendChild(path);
    ctrl_progress_hideMiniPlayer.appendChild(svg);
    ctrl_progress_hideMiniPlayer.addEventListener("click", () => {
      _document.body.classList.remove("efyt-mini-player");
    });

    displayUpdateNotification();
  }

  // OK
  function displayUpdateNotification() {
    efytReload2 = _document.createElement("efyt-reload");
    efytReload2.dir = "ltr";
    efytReload2.textContent = "Enhancer for YouTube™ has just been updated, all the YouTube pages must be reloaded.";
    _document.body.appendChild(efytReload2);
  }

  // OK
  function updateControlsBar() {
    if ("watch" === determineYoutubePath() && moviePlayer && videoPlaybackController) {
      if (!controlsBar) {
        initControlsBar();
      }
      if (!moviePlayer.contains(userInstance) && !videoPlaybackController.contains(userInstance)) {
        if ("fixed" === settings.controlbar.position) {
          moviePlayer.appendChild(userInstance);
        } else {
          if (settings.controlbar.active) {
            _document.documentElement.classList.add("efyt-control-bar-position-absolute");
          }
          videoPlaybackController.appendChild(userInstance);
        }
        updateControlStyles();
        updatePlaybackControls();
        _document.dispatchEvent(new Event("efyt-get-messages"));
      }
      controlsBarFlag = undefined;
    }
  }

  // OK
  function initControlsBar() {
    settingsButtons = moviePlayer.querySelector(".ytp-settings-button, .ytp-size-button, .ytp-fullscreen-button");
    ytTooltipText = _document.createElement("span");
    ytTooltipText.className = "ytp-tooltip-text";
    var btn_Loop = _document.createElement("div");
    btn_Loop.appendChild(ytTooltipText);
    btn_Loop.className = "ytp-tooltip-text-wrapper";
    ytpTooltipWrapper = _document.createElement("div");
    ytpTooltipWrapper.appendChild(btn_Loop);
    ytpTooltipWrapper.className = "ytp-tooltip ytp-efyt-tooltip";
    ytpTooltipWrapper.style.display = "none";
    moviePlayer.appendChild(ytpTooltipWrapper);
    var docFragment = _document.createDocumentFragment();
    btn_Loop = generateButtonElement("loop", "m 13,13 h 10 v 3 l 4,-4 -4,-4 v 3 H 11 v 6 h 2 z M 23,23 H 13 v -3 l -4,4 4,4 v -3 h 12 v -6 h -2 z");
    btn_Loop[0].id = btn_Loop[1].id = "efyt-loop";
    btn_Loop[0].dataset.message = btn_Loop[1].dataset.message = "loop";
    btn_Loop[0].addEventListener("click", onClickLoop);
    btn_Loop[1].addEventListener("click", onClickLoop);
    btn_Loop[0].addEventListener("contextmenu", ctxLoop, true);
    btn_Loop[1].addEventListener("contextmenu", ctxLoop, true);
    docFragment.appendChild(btn_Loop[0]);
    var btn_stopButton = generateButtonElement("stop", "M 9.9999997,10 H 26 V 26 H 9.9999997 Z");
    btn_stopButton[0].id = btn_stopButton[1].id = "efyt-stop";
    btn_stopButton[0].dataset.message = btn_stopButton[1].dataset.message = "stop";
    btn_stopButton[0].addEventListener("click", onclickStopVideoPlayback);
    btn_stopButton[1].addEventListener("click", onclickStopVideoPlayback);
    docFragment.appendChild(btn_stopButton[0]);
    var btn_reversePlaylist = generateButtonElement("reverse-playlist", "M 12,11 V 23 H 9 l 4,4 4,-4 H 14 V 13 11 Z m 11,-2 -4,4 h 3 v 10 2 h 2 V 13 h 3 z");
    btn_reversePlaylist[0].id = btn_reversePlaylist[1].id = "efyt-reverse-playlist";
    btn_reversePlaylist[0].dataset.message = btn_reversePlaylist[1].dataset.message = "reverse_playlist";
    btn_reversePlaylist[0].addEventListener("click", onClickReversePL);
    btn_reversePlaylist[1].addEventListener("click", onClickReversePL);
    btn_reversePlaylist[0].addEventListener("contextmenu", ctxReversePL, true);
    btn_reversePlaylist[1].addEventListener("contextmenu", ctxReversePL, true);
    docFragment.appendChild(btn_reversePlaylist[0]);
    var btn_Options = moviePlayer.querySelector(".ytp-left-controls");
    btn_Options && btn_Options.insertBefore(docFragment, btn_Options.firstChild);
    var btn_volumeBooster = generateButtonElement("volume-booster", "M 8.5 9 C 6.195898 11.304103 4.7695312 14.486564 4.7695312 18 C 4.7695312 21.513437 6.195898 24.695899 8.5 27 L 9.8496094 25.650391 C 7.8892134 23.689995 6.6796875 20.978784 6.6796875 18 C 6.6796875 15.021216 7.8892134 12.310004 9.8496094 10.349609 L 8.5 9 z M 27.5 9 L 26.150391 10.349609 C 28.110787 12.310004 29.320313 15.021216 29.320312 18 C 29.320312 20.978784 28.110787 23.689995 26.150391 25.650391 L 27.5 27 C 29.804102 24.695899 31.230469 21.513437 31.230469 18 C 31.230469 14.486564 29.804102 11.304103 27.5 9 z M 18.800781 10 L 14 19.599609 L 17.199219 19.599609 L 17.199219 26 L 22 16.400391 L 18.800781 16.400391 L 18.800781 10 z M 11.699219 11.699219 C 10.082529 13.31591 9.0898437 15.54314 9.0898438 18 C 9.0898438 20.45686 10.082529 22.684091 11.699219 24.300781 L 13.048828 22.951172 C 11.775844 21.678187 10.998047 19.934936 10.998047 18 C 10.998047 16.065064 11.788574 14.321814 13.048828 13.048828 L 11.699219 11.699219 z M 24.300781 11.699219 L 22.951172 13.048828 C 24.211427 14.321814 25.001953 16.065064 25.001953 18 C 25.001953 19.934936 24.211427 21.678187 22.951172 22.951172 L 24.300781 24.300781 C 25.917473 22.684091 26.910156 20.45686 26.910156 18 C 26.910156 15.54314 25.917473 13.31591 24.300781 11.699219 z M 18.384766 11.726562 L 18.384766 16.853516 L 21.298828 16.853516 L 17.615234 24.273438 L 17.615234 19.146484 L 14.755859 19.146484 L 18.384766 11.726562 z");
    btn_volumeBooster[0].id = btn_volumeBooster[1].id = "efyt-volume-booster";
    btn_volumeBooster[0].dataset.message = btn_volumeBooster[1].dataset.message = "boost_volume";
    btn_volumeBooster[0].dataset.on = btn_volumeBooster[1].dataset.on = "M 18.799896,16.4 V 10 l -4.8,9.6 h 3.2 V 26 l 4.8,-9.6 z m -7.101273,7.901273 1.349363,-1.349363 C 11.775002,21.678925 10.998482,19.934936 10.998482,18 c 0,-1.934936 0.789249,-3.678925 2.049504,-4.951911 L 11.698623,11.698726 C 10.081933,13.315417 9.089005,15.543139 9.089005,18 c 0,2.456859 0.992928,4.684583 2.609618,6.301273 z M 25.001311,18 c 0,1.934936 -0.789252,3.678925 -2.049506,4.95191 l 1.349363,1.349363 C 25.917859,22.684583 26.910787,20.456859 26.910787,18 c 0,-2.456861 -0.992928,-4.684583 -2.609619,-6.301274 l -1.349363,1.349363 C 24.212059,14.321075 25.001311,16.065064 25.001311,18 Z M 6.679373,18 c 0,-2.978784 1.209334,-5.69024 3.169731,-7.650635 L 8.499741,9 c -2.304102,2.304102 -3.729845,5.486563 -3.729845,9 0,3.513437 1.425743,6.695898 3.729845,9 L 9.849104,25.650636 C 7.888707,23.69024 6.679373,20.978784 6.679373,18 Z m 24.550731,0 c 0,-3.513437 -1.425742,-6.695898 -3.729845,-9 l -1.349363,1.349365 c 1.960395,1.960395 3.169731,4.671851 3.169731,7.650635 0,2.978784 -1.209336,5.69024 -3.169731,7.650636 L 27.500259,27 c 2.304103,-2.304102 3.729845,-5.486563 3.729845,-9 z";
    btn_volumeBooster[0].dataset.off = btn_volumeBooster[1].dataset.off = "M 8.5 9 C 6.195898 11.304103 4.7695312 14.486564 4.7695312 18 C 4.7695312 21.513437 6.195898 24.695899 8.5 27 L 9.8496094 25.650391 C 7.8892134 23.689995 6.6796875 20.978784 6.6796875 18 C 6.6796875 15.021216 7.8892134 12.310004 9.8496094 10.349609 L 8.5 9 z M 27.5 9 L 26.150391 10.349609 C 28.110787 12.310004 29.320313 15.021216 29.320312 18 C 29.320312 20.978784 28.110787 23.689995 26.150391 25.650391 L 27.5 27 C 29.804102 24.695899 31.230469 21.513437 31.230469 18 C 31.230469 14.486564 29.804102 11.304103 27.5 9 z M 18.800781 10 L 14 19.599609 L 17.199219 19.599609 L 17.199219 26 L 22 16.400391 L 18.800781 16.400391 L 18.800781 10 z M 11.699219 11.699219 C 10.082529 13.31591 9.0898437 15.54314 9.0898438 18 C 9.0898438 20.45686 10.082529 22.684091 11.699219 24.300781 L 13.048828 22.951172 C 11.775844 21.678187 10.998047 19.934936 10.998047 18 C 10.998047 16.065064 11.788574 14.321814 13.048828 13.048828 L 11.699219 11.699219 z M 24.300781 11.699219 L 22.951172 13.048828 C 24.211427 14.321814 25.001953 16.065064 25.001953 18 C 25.001953 19.934936 24.211427 21.678187 22.951172 22.951172 L 24.300781 24.300781 C 25.917473 22.684091 26.910156 20.45686 26.910156 18 C 26.910156 15.54314 25.917473 13.31591 24.300781 11.699219 z M 18.384766 11.726562 L 18.384766 16.853516 L 21.298828 16.853516 L 17.615234 24.273438 L 17.615234 19.146484 L 14.755859 19.146484 L 18.384766 11.726562 z";
    btn_volumeBooster[0].addEventListener("click", onClickVolumeBooster);
    btn_volumeBooster[1].addEventListener("click", onClickVolumeBooster);
    var btn_customScript;
    1 < (null == (btn_customScript = gainControl) ? undefined : btn_customScript.gain.value) && btn_volumeBooster.forEach(L => {
      L.classList.add("active");
      L.querySelector("path").setAttributeNS(null, "d", L.dataset.on);
    });
    docFragment = moviePlayer.querySelector(".ytp-volume-area");
    btn_Options && docFragment && btn_Options.insertBefore(btn_volumeBooster[0], docFragment.nextSibling);
    docFragment = _document.createDocumentFragment();
    controlsBar = _document.createElement("span");
    controlsBar.id = "ytp-efyt-controls";
    try {
      _window.localStorage.getItem("efyt-controls-visible") && controlsBar.classList.add("visible");
    } catch (L) { }
    var btn_Controls = generateButtonElement("controls-button", "m 10.823624,14.695941 c -1.315669,0 -2.392125,1.076456 -2.392125,2.392125 0,1.315668 1.076456,2.392125 2.392125,2.392125 1.315669,0 2.392125,-1.076457 2.392125,-2.392125 0,-1.315669 -1.076456,-2.392125 -2.392125,-2.392125 z m 14.35275,0 c -1.315669,0 -2.392125,1.076456 -2.392125,2.392125 0,1.315668 1.076456,2.392125 2.392125,2.392125 1.315669,0 2.392125,-1.076457 2.392125,-2.392125 0,-1.315669 -1.076456,-2.392125 -2.392125,-2.392125 z m -7.176375,0 c -1.315669,0 -2.392125,1.076456 -2.392125,2.392125 0,1.315668 1.076456,2.392125 2.392125,2.392125 1.315669,0 2.392125,-1.076457 2.392125,-2.392125 0,-1.315669 -1.076456,-2.392125 -2.392125,-2.392125 z")[0];
    btn_Controls.id = "efyt-controls-button";
    btn_Controls.hidden = false;
    btn_Controls.classList.remove("ytp-efyt-button");
    btn_Controls.addEventListener("click", () => {
      controlsBar.classList.toggle("visible");
      try {
        controlsBar.classList.contains("visible") ? _window.localStorage.setItem("efyt-controls-visible", true) : _window.localStorage.removeItem("efyt-controls-visible");
      } catch (L) { }
      controlsBar.querySelectorAll(".ytp-efyt-button").forEach(L => {
        controlsBar.classList.contains("visible") ? L.removeAttribute("tabindex") : L.tabIndex = -1;
      });
    });
    btn_Controls.removeEventListener("mouseover", showTooltipOnHover);
    btn_Controls.removeEventListener("mouseout", hideTooltip);
    controlsBar.appendChild(btn_Controls);
    btn_Options = generateButtonElement("options", "m 17.215778,7.9998438 -0.121201,1.8617668 a 7.2941366,7.2941366 0 0 0 -2.61169,0.8471364 l -1.19138,-1.433778 -0.19737,0.143504 -0.437247,0.3173086 -0.436823,0.3177284 -0.197372,0.143504 0.993587,1.573917 a 7.2941366,7.2941366 0 0 0 -1.611792,2.223684 l -1.8070586,-0.459551 -0.075748,0.231879 -0.1666512,0.513838 -0.1670707,0.513838 -0.075329,0.232299 1.7271025,0.688064 a 7.2941366,7.2941366 0 0 0 -0.133827,1.374862 7.2941366,7.2941366 0 0 0 0.136352,1.374021 l -1.7296275,0.689325 0.075329,0.231879 0.1670707,0.513837 0.1666512,0.513838 0.075748,0.231877 1.8066396,-0.459549 a 7.2941366,7.2941366 0 0 0 1.614314,2.220318 l -0.99569,1.577282 0.197372,0.143505 0.436823,0.31773 0.437247,0.317306 0.19737,0.143506 1.187172,-1.42831 a 7.2941366,7.2941366 0 0 0 2.615898,0.844193 l 0.121201,1.859242 h 0.244084 0.53993 0.540349 0.244083 l 0.1212,-1.861768 a 7.2941366,7.2941366 0 0 0 2.611271,-0.847137 l 1.1918,1.43378 0.197372,-0.143506 0.437244,-0.317306 0.436827,-0.31773 0.19737,-0.143505 -0.993589,-1.573917 a 7.2941366,7.2941366 0 0 0 1.611792,-2.223683 l 1.807059,0.459549 0.07575,-0.231878 0.166648,-0.513837 0.16707,-0.513838 0.07533,-0.231879 -1.727521,-0.688483 a 7.2941366,7.2941366 0 0 0 0.134246,-1.374863 7.2941366,7.2941366 0 0 0 -0.13635,-1.37402 l 1.729625,-0.688905 -0.07533,-0.232299 -0.16707,-0.513838 -0.166648,-0.513838 -0.07575,-0.231879 -1.806636,0.459551 A 7.2941366,7.2941366 0 0 0 22.981616,11.774298 L 23.977308,10.197014 23.779938,10.05351 23.343111,9.7357816 22.905867,9.418473 22.708495,9.274969 21.521325,10.703277 A 7.2941366,7.2941366 0 0 0 18.905424,9.8590851 l -0.1212,-1.8592413 h -0.244083 -0.540349 -0.53993 z m 0.784434,3.9903412 a 5.0996903,5.0996903 0 0 1 5.099659,5.099659 5.0996903,5.0996903 0 0 1 -5.099659,5.09966 5.0996903,5.0996903 0 0 1 -5.100078,-5.09966 5.0996903,5.0996903 0 0 1 5.100078,-5.099659 z m 0,1.292801 a 3.8068902,3.8068902 0 0 0 -3.807279,3.806858 3.8068902,3.8068902 0 0 0 3.807279,3.80686 3.8068902,3.8068902 0 0 0 3.806859,-3.80686 3.8068902,3.8068902 0 0 0 -3.806859,-3.806858 z m 0,0.804632 a 3.0021577,3.0021577 0 0 1 3.001804,3.002226 3.0021577,3.0021577 0 0 1 -3.001804,3.002225 3.0021577,3.0021577 0 0 1 -3.002226,-3.002225 3.0021577,3.0021577 0 0 1 3.002226,-3.002226 z");
    btn_Options[0].id = btn_Options[1].id = "efyt-options";
    btn_Options[0].dataset.message = btn_Options[1].dataset.message = "options";
    btn_Options[0].addEventListener("click", onClickOptions);
    btn_Options[1].addEventListener("click", onClickOptions);
    btn_Options[1].addEventListener("contextmenu", ctxPreventContextMenu);
    controlsBar.appendChild(btn_Options[0]);
    btn_customScript = generateButtonElement("custom-script", "m 19.658,22.84 5.75,-5.75 -5.75,-5.75 1.75,-1.7499999 7.5,7.4999999 -7.5,7.5 z m -3.316,0 -5.75,-5.75 5.75,-5.75 -1.75,-1.7499999 -7.5,7.4999999 7.5,7.5 z");
    btn_customScript[0].id = btn_customScript[1].id = "efyt-custom-script";
    btn_customScript[0].dataset.message = btn_customScript[1].dataset.message = "custom_script";
    btn_customScript[0].addEventListener("click", onClickCustomScript);
    btn_customScript[1].addEventListener("click", onClickCustomScript);
    btn_customScript[1].addEventListener("contextmenu", ctxPreventContextMenu);
    controlsBar.appendChild(btn_customScript[0]);
    var btn_KbShortcuts = generateButtonElement("keyboard-shortcuts", "m 24.492861,11.895714 h 2.597142 v 2.597143 h -2.597142 z m 0,3.895714 h 2.597142 v 2.597144 h -2.597142 z m -3.895714,-3.895714 h 2.597143 v 2.597143 h -2.597143 z m 0,3.895714 h 2.597143 v 2.597144 h -2.597143 z m -7.791429,3.895715 H 23.19429 v 2.597143 H 12.805718 Z M 8.9100043,11.895714 h 2.5971427 v 2.597143 H 8.9100043 Z m 0,3.895714 h 2.5971427 v 2.597144 H 8.9100043 Z m 3.8957137,0 h 2.597143 v 2.597144 h -2.597143 z m 0,-3.895714 h 2.597143 v 2.597143 h -2.597143 z m 3.895715,3.895714 h 2.597142 v 2.597144 h -2.597142 z m 0,-3.895714 h 2.597142 v 2.597143 H 16.701433 Z M 7.6113281,8 C 6.1828991,8 5.0273437,9.1692275 5.0273438,10.597656 l -0.013672,12.984375 c 0,1.428429 1.1692272,2.597657 2.5976562,2.597657 H 28.388672 c 1.428429,0 2.597656,-1.169228 2.597656,-2.597657 V 10.597656 C 30.986328,9.1692274 29.817101,8 28.388672,8 Z M 8.7617188,9.8496094 H 27.238281 c 1.27016,0 2.308594,0.9307206 2.308594,2.0683596 v 10.341797 c 0,1.13764 -1.038434,2.068359 -2.308594,2.068359 H 8.7617188 c -1.2701601,0 -2.3085938,-0.930719 -2.3085938,-2.068359 l 0.011719,-10.341797 c -10e-8,-1.137639 1.026715,-2.0683596 2.296875,-2.0683596 z");
    btn_KbShortcuts[0].id = btn_KbShortcuts[1].id = "efyt-keyboard-shortcuts";
    btn_KbShortcuts[0].dataset.message = btn_KbShortcuts[1].dataset.message = "keyboard_shortcuts";
    btn_KbShortcuts[0].addEventListener("click", onClickKeyboardShortcuts);
    btn_KbShortcuts[1].addEventListener("click", onClickKeyboardShortcuts);
    btn_KbShortcuts[1].addEventListener("contextmenu", ctxPreventContextMenu);
    controlsBar.appendChild(btn_KbShortcuts[0]);
    var btn_Screenshot = generateButtonElement("screenshot", "M 26.079999,10.02 H 22.878298 L 21.029999,8 h -6.06 l -1.8483,2.02 H 9.9200015 c -1.111,0 -2.02,0.909 -2.02,2.02 v 12.12 c 0,1.111 0.909,2.02 2.02,2.02 H 26.079999 c 1.111,0 2.019999,-0.909 2.019999,-2.02 V 12.04 c 0,-1.111 -0.909,-2.02 -2.019999,-2.02 z m 0,14.14 H 9.9200015 V 12.04 h 4.0904965 l 1.8483,-2.02 h 4.2824 l 1.8483,2.02 h 4.0905 z m -8.08,-11.11 c -2.7876,0 -5.05,2.2624 -5.05,5.05 0,2.7876 2.2624,5.05 5.05,5.05 2.7876,0 5.049999,-2.2624 5.049999,-5.05 0,-2.7876 -2.262399,-5.05 -5.049999,-5.05 z m 0,8.08 c -1.6665,0 -3.03,-1.3635 -3.03,-3.03 0,-1.6665 1.3635,-3.03 3.03,-3.03 1.6665,0 3.03,1.3635 3.03,3.03 0,1.6665 -1.3635,3.03 -3.03,3.03 z");
    btn_Screenshot[0].id = btn_Screenshot[1].id = "efyt-screenshot";
    btn_Screenshot[0].dataset.message = btn_Screenshot[1].dataset.message = "screenshot";
    btn_Screenshot[0].addEventListener("click", captureVideoScreenshot);
    btn_Screenshot[1].addEventListener("click", captureVideoScreenshot);
    btn_Screenshot[1].addEventListener("contextmenu", ctxPreventContextMenu);
    controlsBar.appendChild(btn_Screenshot[0]);
    var btn_FlipVertically = generateButtonElement("flip-vertically", "m 8.897825,20.136232 v 2.022705 h 2.022705 v -2.022705 z m 12.136233,4.04541 v 2.022707 h 2.022705 v -2.022707 z m 6.068116,-16.181643 -18.204349,0 v 6.068116 h 2.022705 v -4.045411 l 14.158938,0 v 4.045411 h 2.022706 z m 0,16.181643 h -2.022706 v 2.022707 h 2.022706 z M 6.87512,16.090821 v 2.022706 h 22.24976 v -2.022706 z m 6.068116,8.090821 v 2.022707 h 2.022706 v -2.022707 z m 12.136232,-4.04541 v 2.022705 h 2.022706 v -2.022705 z m -8.090822,4.04541 v 2.022707 h 2.022706 v -2.022707 z m -8.090821,0 v 2.022707 h 2.022705 v -2.022707 z");
    btn_FlipVertically[0].id = btn_FlipVertically[1].id = "efyt-flip-vertically";
    btn_FlipVertically[0].dataset.message = btn_FlipVertically[1].dataset.message = "flip_vertically";
    btn_FlipVertically[0].addEventListener("click", toggleButtonClass);
    btn_FlipVertically[1].addEventListener("click", toggleButtonClass);
    btn_FlipVertically[1].addEventListener("contextmenu", ctxPreventContextMenu);
    controlsBar.appendChild(btn_FlipVertically[0]);
    var btn_flipButton = generateButtonElement("flip-horizontally", "m 21.034058,26.204349 h 2.022705 v -2.022705 h -2.022705 z m 4.04541,-12.136233 h 2.022707 V 12.045411 H 25.079468 Z M 8.897825,8 v 18.204349 h 6.068116 V 24.181644 H 10.92053 V 10.022706 h 4.045411 V 8 Z m 16.181643,0 v 2.022706 h 2.022707 V 8 Z m -8.090821,20.227054 h 2.022706 V 5.9772944 h -2.022706 z m 8.090821,-6.068116 h 2.022707 v -2.022706 h -2.022707 z m -4.04541,-12.136232 h 2.022705 V 8 h -2.022705 z m 4.04541,8.090822 h 2.022707 v -2.022706 h -2.022707 z m 0,8.090821 h 2.022707 v -2.022705 h -2.022707 z");
    btn_flipButton[0].id = btn_flipButton[1].id = "efyt-flip-horizontally";
    btn_flipButton[0].dataset.message = btn_flipButton[1].dataset.message = "flip_horizontally";
    btn_flipButton[0].addEventListener("click", toggleButtonClass);
    btn_flipButton[1].addEventListener("click", toggleButtonClass);
    btn_flipButton[1].addEventListener("contextmenu", ctxPreventContextMenu);
    controlsBar.appendChild(btn_flipButton[0]);
    var btn_VideoFilter = generateButtonElement("video-filters", "m 22.899051,15.920251 -1.037187,2.272983 -1.037186,-2.272983 -2.272983,-1.037187 2.272983,-1.037186 1.037186,-2.272983 1.037187,2.272983 2.272983,1.037186 z m -6.278288,3.65222 -1.379238,3.034322 -1.379237,-3.034322 -3.034322,-1.379237 3.034322,-1.379237 1.379237,-3.034323 1.379238,3.034323 3.034322,1.379237 z M 5.390625,8 v 18.179688 h 25.21875 V 8 Z m 2.0195312,2.009766 H 28.589844 V 24.169922 H 7.4101562 Z");
    btn_VideoFilter[0].id = btn_VideoFilter[1].id = "efyt-video-filters";
    btn_VideoFilter[0].dataset.message = btn_VideoFilter[1].dataset.message = "video_filters";
    btn_VideoFilter[0].addEventListener("click", showVideoFilters);
    btn_VideoFilter[1].addEventListener("click", showVideoFilters);
    btn_VideoFilter[0].addEventListener("contextmenu", ctxVideoFilters, true);
    btn_VideoFilter[1].addEventListener("contextmenu", ctxVideoFilters, true);
    controlsBar.appendChild(btn_VideoFilter[0]);
    var btn_SpeedPlus = generateButtonElement("speed-plus", "m 11.494141,8 c -2.6853634,0 -4.8652346,2.17987 -4.8652348,4.865234 0,2.685363 2.1798714,4.865235 4.8652348,4.865235 2.685364,0 4.865234,-2.179872 4.865234,-4.865235 C 16.359375,10.17987 14.179505,8 11.494141,8 Z m -0.679688,1.4609375 h 1.359375 v 2.7246095 h 2.722656 v 1.359375 h -2.722656 v 2.722656 H 10.814453 V 13.544922 H 8.0917969 v -1.359375 h 2.7226561 z m 6.865235,-1.4550784 a 11.389523,11.389523 0 0 0 -1.66211,0.185547 c 0.60671,0.587327 1.100701,1.289573 1.44336,2.0742189 a 9.1116182,9.1116182 0 0 1 4.597656,0.9375 l 2.107422,-1.4003909 a 11.389523,11.389523 0 0 0 -6.486328,-1.796875 z m 8.365234,3.2773439 -9.667969,6.445313 a 2.2779046,2.2779046 0 0 0 0,3.224609 2.2779046,2.2779046 0 0 0 3.222656,0 z m 1.492187,1.867188 -0.0098,0.01172 -1.402344,2.107422 a 9.1116182,9.1116182 0 0 1 -0.25,8.632813 H 10.089844 A 9.1116182,9.1116182 0 0 1 8.8925783,18.830078 C 8.1084503,18.487267 7.4072416,17.993284 6.8203125,17.386719 a 11.389523,11.389523 0 0 0 1.3105468,7.654297 2.2779046,2.2779046 0 0 0 1.9589847,1.138672 h 15.773437 a 2.2779046,2.2779046 0 0 0 1.982422,-1.138672 11.389523,11.389523 0 0 0 -0.308594,-11.890625 z");
    btn_SpeedPlus[0].id = btn_SpeedPlus[1].id = "efyt-speed-plus";
    btn_SpeedPlus[0].dataset.message = btn_SpeedPlus[1].dataset.message = "speed";
    btn_SpeedPlus[0].addEventListener("click", updatePlaybackSpeedPlus);
    btn_SpeedPlus[1].addEventListener("click", updatePlaybackSpeedPlus);
    btn_SpeedPlus[1].addEventListener("contextmenu", ctxPreventContextMenu);
    controlsBar.appendChild(btn_SpeedPlus[0]);
    var btn_SpeedControl = generateButtonElement("speed", "m 27.526463,13.161756 -1.400912,2.107062 a 9.1116182,9.1116182 0 0 1 -0.250569,8.633258 H 10.089103 A 9.1116182,9.1116182 0 0 1 22.059491,11.202758 L 24.166553,9.8018471 A 11.389523,11.389523 0 0 0 8.1301049,25.041029 2.2779046,2.2779046 0 0 0 10.089103,26.179981 H 25.863592 A 2.2779046,2.2779046 0 0 0 27.845369,25.041029 11.389523,11.389523 0 0 0 27.537852,13.150367 Z M 16.376119,20.95219 a 2.2779046,2.2779046 0 0 0 3.223235,0 l 6.446471,-9.669705 -9.669706,6.44647 a 2.2779046,2.2779046 0 0 0 0,3.223235 z");
    btn_SpeedControl[0].id = btn_SpeedControl[1].id = "efyt-speed";
    btn_SpeedControl[0].dataset.message = btn_SpeedControl[1].dataset.message = "speed";
    btn_SpeedControl[0].addEventListener("click", updatePlaybackSpeedDefault);
    btn_SpeedControl[1].addEventListener("click", updatePlaybackSpeedDefault);
    btn_SpeedControl[0].addEventListener("wheel", updatePlaybackSpeedWheel, true);
    btn_SpeedControl[1].addEventListener("wheel", updatePlaybackSpeedWheel, true);
    btn_SpeedControl[0].addEventListener("contextmenu", setDefaultPlaybackSpeed, true);
    btn_SpeedControl[1].addEventListener("contextmenu", setDefaultPlaybackSpeed, true);
    controlsBar.appendChild(btn_SpeedControl[0]);
    var btn_SpeedMinus = generateButtonElement("speed-minus", "M 24.505859 8 C 21.820495 8 19.640625 10.17987 19.640625 12.865234 C 19.640625 15.550597 21.820495 17.730469 24.505859 17.730469 C 27.191222 17.730469 29.371094 15.550597 29.371094 12.865234 C 29.371094 10.17987 27.191222 8 24.505859 8 z M 18.320312 8.0058594 A 11.389523 11.389523 0 0 0 11.833984 9.8027344 L 13.941406 11.203125 A 9.1116182 9.1116182 0 0 1 18.539062 10.265625 C 18.881721 9.48098 19.375712 8.7787333 19.982422 8.1914062 A 11.389523 11.389523 0 0 0 18.320312 8.0058594 z M 9.9550781 11.283203 L 16.400391 20.953125 A 2.2779046 2.2779046 0 0 0 19.623047 20.953125 A 2.2779046 2.2779046 0 0 0 19.623047 17.728516 L 9.9550781 11.283203 z M 21.103516 12.185547 L 23.826172 12.185547 L 25.185547 12.185547 L 26.738281 12.185547 L 27.908203 12.185547 L 27.908203 13.544922 L 25.455078 13.544922 L 25.185547 13.544922 L 23.826172 13.544922 L 23.367188 13.544922 L 21.103516 13.544922 L 21.103516 12.185547 z M 8.4628906 13.150391 A 11.389523 11.389523 0 0 0 8.1542969 25.041016 A 2.2779046 2.2779046 0 0 0 10.136719 26.179688 L 25.910156 26.179688 A 2.2779046 2.2779046 0 0 0 27.869141 25.041016 A 11.389523 11.389523 0 0 0 29.179688 17.386719 C 28.592758 17.993284 27.89155 18.487267 27.107422 18.830078 A 9.1116182 9.1116182 0 0 1 25.910156 23.902344 L 10.125 23.902344 A 9.1116182 9.1116182 0 0 1 9.875 15.269531 L 8.4726562 13.162109 L 8.4628906 13.150391 z ");
    btn_SpeedMinus[0].id = btn_SpeedMinus[1].id = "efyt-speed-minus";
    btn_SpeedMinus[0].dataset.message = btn_SpeedMinus[1].dataset.message = "speed";
    btn_SpeedMinus[0].addEventListener("click", updatePlaybackSpeedMinus);
    btn_SpeedMinus[1].addEventListener("click", updatePlaybackSpeedMinus);
    btn_SpeedMinus[1].addEventListener("contextmenu", ctxPreventContextMenu);
    controlsBar.appendChild(btn_SpeedMinus[0]);
    var btn_PopupPlayer = generateButtonElement("pop-up-player", "m 21.554375,7.9999999 h 2.02 V 10.02 h -2.02 z m 4.04,0 h 2.02 V 10.02 h -2.02 z M 5.394375,16.08 h 2.02 v 2.02 h -2.02 z m 0,-4.04 h 2.02 v 2.02 h -2.02 z m 0,8.08 h 2.02 v 2.02 h -2.02 z m 12.12,-12.1200001 h 2.02 V 10.02 h -2.02 z M 30.605625,26.18 H 9.434375 V 12.04 h 21.17125 z m -2.02,-12.12 h -17.13125 v 10.1 h 17.13125 z M 13.474375,7.9999999 h 2.02 V 10.02 h -2.02 z m -4.04,0 h 2.02 V 10.02 h -2.02 z m -4.04,0 h 2.02 V 10.02 h -2.02 z");
    btn_PopupPlayer[0].id = btn_PopupPlayer[1].id = "efyt-pop-up-player";
    btn_PopupPlayer[0].dataset.message = btn_PopupPlayer[1].dataset.message = "pop_up_player";
    btn_PopupPlayer[0].addEventListener("click", onClickPopupPlayer);
    btn_PopupPlayer[1].addEventListener("click", onClickPopupPlayer);
    btn_PopupPlayer[0].addEventListener("contextmenu", ctxClickPopupPlayer, true);
    btn_PopupPlayer[1].addEventListener("contextmenu", ctxClickPopupPlayer, true);
    controlsBar.appendChild(btn_PopupPlayer[0]);
    var btn_SizeButton = generateButtonElement("size", "M 5.390625,7.9999999 V 26.179687 h 25.21875 V 7.9999999 Z M 7.410156,10.009766 H 28.589844 V 24.169922 H 7.410156 Z m 4.040294,4.050342 h 3.029835 V 12.040219 H 9.430562 v 5.049722 h 2.019888 z m 15.118897,3.029833 h -2.019888 v 3.029834 h -3.029834 v 2.019889 h 5.049722 z");
    btn_SizeButton[0].id = btn_SizeButton[1].id = "efyt-size";
    btn_SizeButton[0].dataset.message = btn_SizeButton[1].dataset.message = "expand";
    btn_SizeButton[0].dataset.expand = btn_SizeButton[1].dataset.expand = "M 5.390625,7.9999999 V 26.179687 h 25.21875 V 7.9999999 Z M 7.410156,10.009766 H 28.589844 V 24.169922 H 7.410156 Z m 4.040294,4.050342 h 3.029835 V 12.040219 H 9.430562 v 5.049722 h 2.019888 z m 15.118897,3.029833 h -2.019888 v 3.029834 h -3.029834 v 2.019889 h 5.049722 z";
    btn_SizeButton[0].dataset.shrink = btn_SizeButton[1].dataset.shrink = "m 5.390625,8 v 18.179687 h 25.21875 V 8 Z m 2.019531,2.009765 H 28.589844 V 24.169922 H 7.410156 Z M 19.45325,22.331983 h 1.762511 V 19.688214 H 23.85953 V 17.925702 H 19.45325 Z M 14.784019,14.491472 H 12.14025 v 1.762512 h 4.406281 v -4.40628 h -1.762512 z m 0,5.196743 H 12.14025 v -1.762512 h 4.406281 v 4.40628 h -1.762512 z m 4.669231,-7.840512 h 1.762511 v 2.643769 h 2.643769 v 1.762512 h -4.40628 z";
    btn_SizeButton[0].addEventListener("click", onClickPlayerSize);
    btn_SizeButton[1].addEventListener("click", onClickPlayerSize);
    btn_SizeButton[0].addEventListener("contextmenu", ctxPlayerSize, true);
    btn_SizeButton[1].addEventListener("contextmenu", ctxPlayerSize, true);
    controlsBar.appendChild(btn_SizeButton[0]);
    var btn_cinemaMode = generateButtonElement("cinema-mode", "m 8,8.1430084 c -1.375,0 -2.4882814,1.125 -2.4882812,2.4999996 L 5.5,23.679025 c 0,1.375 1.125,2.5 2.4999999,2.5 H 28 c 1.375,0 2.5,-1.125 2.5,-2.5 V 7.9999999 h -5 L 28,11.75 h -3.75 l -2.5,-3.7500001 h -2.5 L 21.75,11.75 H 18 L 15.5,7.9999999 H 13 L 15.5,11.75 H 11.75 L 9.2500001,8.1430084 Z M 7.7714843,14.017578 H 28.207031 v 9.856759 H 7.7714843 Z");
    btn_cinemaMode[0].id = btn_cinemaMode[1].id = "efyt-cinema-mode";
    btn_cinemaMode[0].dataset.message = btn_cinemaMode[1].dataset.message = "cinema_mode";
    btn_cinemaMode[0].addEventListener("click", onClickCinemaMode);
    btn_cinemaMode[1].addEventListener("click", onClickCinemaMode);
    btn_cinemaMode[1].addEventListener("contextmenu", ctxPreventContextMenu);
    controlsBar.appendChild(btn_cinemaMode[0]);
    var btn_EndScreen = generateButtonElement("cards-end-screens", settings.hidecardsendscreens ? "m 16.333008,13.997071 -1.191407,1.201172 2.265625,2.265625 c -1.377916,1.082045 -2.470175,2.518256 -3.121094,4.183593 1.462453,3.711076 5.072089,6.339844 9.298829,6.339844 1.284929,0 2.511765,-0.251825 3.644531,-0.691406 l 0.691406,0.691406 1.19336,-1.193359 z m 7.251953,1.310547 c -1.073592,0 -2.104021,0.169644 -3.076172,0.482421 l 1.833984,1.833985 c 0.397314,-0.118349 0.81106,-0.203125 1.242188,-0.203125 2.333161,0 4.228515,1.893401 4.228515,4.226562 0,0.431127 -0.08478,0.845516 -0.203125,1.234375 l 2.585938,2.587891 c 1.175034,-1.039778 2.10421,-2.342265 2.6875,-3.830078 -1.462452,-3.702623 -5.072088,-6.332031 -9.298828,-6.332031 z m 0.279297,3.830078 2.232421,2.232422 c -0.126803,-1.183487 -1.057388,-2.105619 -2.232421,-2.232422 z m -4.091797,0.701172 1.328125,1.328125 c -0.02536,0.152163 -0.05078,0.311398 -0.05078,0.480468 0,1.403277 1.131879,2.53711 2.535157,2.53711 0.16907,0 0.321805,-0.02674 0.482421,-0.06055 l 1.328126,1.328125 c -0.549476,0.270511 -1.159629,0.421875 -1.810547,0.421875 -2.33316,0 -4.226563,-1.893403 -4.226563,-4.226563 0,-0.650919 0.152005,-1.267571 0.414063,-1.808593 z M 3.1162108,8.0126954 V 26.19043 H 12.522155 V 23.918946 H 5.3876952 V 10.28418 H 25.836914 v 2.857422 h 2.273437 V 8.0126954 Z" : "m 23.585753,15.31167 c -4.224201,0 -7.831669,2.627453 -9.293243,6.336303 1.461574,3.708847 5.069042,6.3363 9.293243,6.3363 4.224201,0 7.831669,-2.627453 9.293242,-6.3363 -1.461573,-3.70885 -5.069041,-6.336303 -9.293242,-6.336303 z m 0,10.560503 c -2.331759,0 -4.224201,-1.892442 -4.224201,-4.2242 0,-2.331759 1.892442,-4.224202 4.224201,-4.224202 2.331758,0 4.224201,1.892443 4.224201,4.224202 0,2.331758 -1.892443,4.2242 -4.224201,4.2242 z m 0,-6.758721 c -1.402435,0 -2.534521,1.132087 -2.534521,2.534521 0,1.402434 1.132086,2.53452 2.534521,2.53452 1.402434,0 2.53452,-1.132086 2.53452,-2.53452 0,-1.402434 -1.132086,-2.534521 -2.53452,-2.534521 z M 7.5464614,12.108004 h 8.9170356 v 3.889561 H 7.5464614 Z M 12.520348,23.921535 H 5.3932636 V 10.287985 H 25.843588 v 2.855964 h 2.272258 V 8.0157271 H 3.1210054 V 26.193793 h 9.3993426 z m -0.66097,-3.803731 a 2.1564575,2.1564575 0 0 1 -2.1564585,2.156458 2.1564575,2.1564575 0 0 1 -2.1564581,-2.156458 2.1564575,2.1564575 0 0 1 2.1564581,-2.156458 2.1564575,2.1564575 0 0 1 2.1564585,2.156458 z");
    btn_EndScreen[0].id = btn_EndScreen[1].id = "efyt-cards-end-screens";
    btn_EndScreen[0].dataset.message = btn_EndScreen[1].dataset.message = "toggle_visibility";
    btn_EndScreen[0].dataset.on = btn_EndScreen[1].dataset.on = "m 23.585753,15.31167 c -4.224201,0 -7.831669,2.627453 -9.293243,6.336303 1.461574,3.708847 5.069042,6.3363 9.293243,6.3363 4.224201,0 7.831669,-2.627453 9.293242,-6.3363 -1.461573,-3.70885 -5.069041,-6.336303 -9.293242,-6.336303 z m 0,10.560503 c -2.331759,0 -4.224201,-1.892442 -4.224201,-4.2242 0,-2.331759 1.892442,-4.224202 4.224201,-4.224202 2.331758,0 4.224201,1.892443 4.224201,4.224202 0,2.331758 -1.892443,4.2242 -4.224201,4.2242 z m 0,-6.758721 c -1.402435,0 -2.534521,1.132087 -2.534521,2.534521 0,1.402434 1.132086,2.53452 2.534521,2.53452 1.402434,0 2.53452,-1.132086 2.53452,-2.53452 0,-1.402434 -1.132086,-2.534521 -2.53452,-2.534521 z M 7.5464614,12.108004 h 8.9170356 v 3.889561 H 7.5464614 Z M 12.520348,23.921535 H 5.3932636 V 10.287985 H 25.843588 v 2.855964 h 2.272258 V 8.0157271 H 3.1210054 V 26.193793 h 9.3993426 z m -0.66097,-3.803731 a 2.1564575,2.1564575 0 0 1 -2.1564585,2.156458 2.1564575,2.1564575 0 0 1 -2.1564581,-2.156458 2.1564575,2.1564575 0 0 1 2.1564581,-2.156458 2.1564575,2.1564575 0 0 1 2.1564585,2.156458 z";
    btn_EndScreen[0].dataset.off = btn_EndScreen[1].dataset.off = "m 16.333008,13.997071 -1.191407,1.201172 2.265625,2.265625 c -1.377916,1.082045 -2.470175,2.518256 -3.121094,4.183593 1.462453,3.711076 5.072089,6.339844 9.298829,6.339844 1.284929,0 2.511765,-0.251825 3.644531,-0.691406 l 0.691406,0.691406 1.19336,-1.193359 z m 7.251953,1.310547 c -1.073592,0 -2.104021,0.169644 -3.076172,0.482421 l 1.833984,1.833985 c 0.397314,-0.118349 0.81106,-0.203125 1.242188,-0.203125 2.333161,0 4.228515,1.893401 4.228515,4.226562 0,0.431127 -0.08478,0.845516 -0.203125,1.234375 l 2.585938,2.587891 c 1.175034,-1.039778 2.10421,-2.342265 2.6875,-3.830078 -1.462452,-3.702623 -5.072088,-6.332031 -9.298828,-6.332031 z m 0.279297,3.830078 2.232421,2.232422 c -0.126803,-1.183487 -1.057388,-2.105619 -2.232421,-2.232422 z m -4.091797,0.701172 1.328125,1.328125 c -0.02536,0.152163 -0.05078,0.311398 -0.05078,0.480468 0,1.403277 1.131879,2.53711 2.535157,2.53711 0.16907,0 0.321805,-0.02674 0.482421,-0.06055 l 1.328126,1.328125 c -0.549476,0.270511 -1.159629,0.421875 -1.810547,0.421875 -2.33316,0 -4.226563,-1.893403 -4.226563,-4.226563 0,-0.650919 0.152005,-1.267571 0.414063,-1.808593 z M 3.1162108,8.0126954 V 26.19043 H 12.522155 V 23.918946 H 5.3876952 V 10.28418 H 25.836914 v 2.857422 h 2.273437 V 8.0126954 Z";
    btn_EndScreen[0].addEventListener("click", onClickCardsOS);
    btn_EndScreen[1].addEventListener("click", onClickCardsOS);
    btn_EndScreen[1].addEventListener("contextmenu", ctxPreventContextMenu);
    controlsBar.appendChild(btn_EndScreen[0]);
    1 >= controlsBar.querySelectorAll(".ytp-efyt-button:not(#efyt-controls-button):not([hidden])").length && (btn_Controls.hidden = true);
    controlsBar.classList.contains("visible") || controlsBar.querySelectorAll(".ytp-efyt-button").forEach(L => {
      L.tabIndex = -1;
    });
    docFragment.appendChild(controlsBar);
    (btn_Controls = moviePlayer.querySelector(".ytp-right-controls")) && btn_Controls.insertBefore(docFragment, btn_Controls.firstChild);
    userInstance = _document.createElement("div");
    userInstance.className = "efyt-control-bar";
    settings.controlbar.autohide && "fixed" === settings.controlbar.position && userInstance.classList.add("auto-hide");
    settings.controlbar.centered && userInstance.classList.add("centered");
    userInstance.appendChild(btn_Loop[1]);
    userInstance.appendChild(btn_stopButton[1]);
    userInstance.appendChild(btn_reversePlaylist[1]);
    userInstance.appendChild(btn_volumeBooster[1]);
    userInstance.appendChild(btn_EndScreen[1]);
    userInstance.appendChild(btn_cinemaMode[1]);
    userInstance.appendChild(btn_SizeButton[1]);
    userInstance.appendChild(btn_PopupPlayer[1]);
    userInstance.appendChild(btn_SpeedMinus[1]);
    userInstance.appendChild(btn_SpeedControl[1]);
    userInstance.appendChild(btn_SpeedPlus[1]);
    userInstance.appendChild(btn_VideoFilter[1]);
    userInstance.appendChild(btn_flipButton[1]);
    userInstance.appendChild(btn_FlipVertically[1]);
    userInstance.appendChild(btn_Screenshot[1]);
    userInstance.appendChild(btn_KbShortcuts[1]);
    userInstance.appendChild(btn_customScript[1]);
    userInstance.appendChild(btn_Options[1]);
    userInstance.addEventListener("mouseenter", L => {
      L.preventDefault();
      L.stopPropagation();
    }, true);
    userInstance.addEventListener("mouseleave", L => {
      L.preventDefault();
      L.stopPropagation();
    }, true);
    userInstance.addEventListener("mousemove", L => {
      _document.fullscreenElement || (L.preventDefault(), L.stopPropagation());
    }, true);
    ytdControlTooltip = _document.createElement("div");
    ytdControlTooltip.className = "efyt-control-bar-tooltip";
    userInstance.appendChild(ytdControlTooltip);
  }

  // OK
  function toggleReversePlaylistControl() {
    if (!videoPlaybackController) return;

    const reversePlaylistButtons = videoPlaybackController.querySelectorAll("button#efyt-reverse-playlist");
    reversePlaylistButtons.forEach(button => {
      if (settings.controls.includes("reverse-playlist")) {
        button.hidden = !_document.location.href.includes("list=");
        if (Ga?.getPlaylistData) {
          const totalVideos = Ga.getPlaylistData()?.totalVideos;
          if (Number.isInteger(totalVideos)) {
            button.hidden = totalVideos <= 1;
          }
        }
      } else {
        button.hidden = true;
      }
    });
  }

  // OK
  function onStateChangeImpl(a) {
    if (!isVideoAvailable || determineYoutubePath() !== "watch") return;

    if (a > 0 && loopControlPanel && !loopControlPanel.hidden) {
      videoObject.loop = true;
    }

    if (a === 1) {
      if (moviePlayer.enhance) updatePlaybackSettings();
      if (settings.pausevideos && !_document.hidden) {
        broadcastChannel.postMessage({ message: "pause-video" });
      }
      if (moviePlayer.checkTimestamp) {
        delete moviePlayer.checkTimestamp;
        const match = _document.location.href.match(/&t=(\d+)s?/);
        if (match && moviePlayer.getCurrentTime() < match[1]) {
          moviePlayer.seekTo(parseInt(match[1], 10));
        }
      }
      if (moviePlayer.efytRestorePlaybackRate) {
        currentPlaybackRate = moviePlayer.efytCurrentPlaybackRate;
        moviePlayer.efytPlaybackRate = currentPlaybackRate;
        delete moviePlayer.efytRestorePlaybackRate;
        delete moviePlayer.efytCurrentPlaybackRate;
        if (settings.overridespeeds) {
          videoObject.playbackRate = currentPlaybackRate;
          videoObject.defaultPlaybackRate = currentPlaybackRate;
        } else {
          moviePlayer.setPlaybackRate?.(currentPlaybackRate);
        }
      }
      if (moviePlayer.hideCuedThumbnailOverlay) {
        delete moviePlayer.hideCuedThumbnailOverlay;
        ThumbnailOverlay.style.display = "none";
        ThumbnailOverlay.style.backgroundImage = "";
        ThumbnailOverlay.style.backgroundSize = "";
        ThumbnailOverlay.style.cursor = "";
      }
      if (moviePlayer.removeBackgroundImage) {
        delete moviePlayer.removeBackgroundImage;
        moviePlayer.style.backgroundImage = "";
        moviePlayer.style.backgroundSize = "";
        moviePlayer.style.cursor = "";
      }
    } else if (a === 0 && isVideoAvailable) {
      setTimeout(() => {
        if (moviePlayer.classList.contains("ended-mode")) {
          ctrl_progress.value = ctrl_progress.max;
        }
      }, 500);
    } else if (a === 5) {
      moviePlayer.enhance = true;
      moviePlayer.checkTimestamp = true;
    }
  }


  // OK
  function onAdStateChangeImpl(a) {
    if (a > 0) {
      if (!moviePlayer.efytRestorePlaybackRate) {
        moviePlayer.efytRestorePlaybackRate = true;
        moviePlayer.efytCurrentPlaybackRate = currentPlaybackRate;
      }
      currentPlaybackRate = Number.isFinite(videoObject.playbackRate) ? videoObject.playbackRate : 1;
      if (loopControlPanel && !loopControlPanel.hidden) {
        videoObject.loop = false;
      }
    }

    if (a === 1) {
      if (settings.pausevideos && !_document.hidden) {
        broadcastChannel.postMessage({ message: "pause-video" });
      }
      if (moviePlayer.hideCuedThumbnailOverlay) {
        delete moviePlayer.hideCuedThumbnailOverlay;
        ThumbnailOverlay.style.display = "none";
        ThumbnailOverlay.style.backgroundImage = "";
        ThumbnailOverlay.style.backgroundSize = "";
        ThumbnailOverlay.style.cursor = "";
      }
      if (moviePlayer.removeBackgroundImage) {
        delete moviePlayer.removeBackgroundImage;
        moviePlayer.style.backgroundImage = "";
        moviePlayer.style.backgroundSize = "";
        moviePlayer.style.cursor = "";
      }
    }
  }

  // OK
  function onPlaybackRateChangeImpl(playbackRate) {
    if (Number.isInteger(playbackRate)) {
      const speedOverlay = moviePlayer.querySelector(".ytp-speedmaster-overlay");
      if (playbackRate === 2 && speedOverlay?.clientWidth > 0) {
        moviePlayer.efytRestorePlaybackRate = true;
      } else if (playbackRate !== 2 && moviePlayer.efytRestorePlaybackRate) {
        delete moviePlayer.efytRestorePlaybackRate;
        if (settings.overridespeeds) {
          videoObject.playbackRate = currentPlaybackRate;
        } else {
          moviePlayer.setPlaybackRate?.(currentPlaybackRate);
        }
      } else {
        currentPlaybackRate = playbackRate;
      }
    }
  }

  // OK
  function onMouseLeave() {
    clearInterval(tmpFun_MouseEnterLeave);
    Aa = xa = ya = false;
    _document.body.classList.remove("efyt-ytp-contextmenu-hidden");
  }

  // OK
  function onMouseEnter() {
    tmpFun_MouseEnterLeave = setInterval(() => {
      const activeElement = _document.activeElement;
      const activeElementClassList = activeElement?.classList;
      if (activeElementClassList?.contains("ytp-progress-bar") || activeElementClassList?.contains("ytp-volume-panel")) {
        focusMoviePlayer();
      }
    }, 3000);
  }

  // OK
  function focusMoviePlayer() {
    let tmpA;
    null == (tmpA = _document.activeElement) || tmpA.blur();
    let tmpB;
    null == (tmpB = moviePlayer) || tmpB.focus({
      preventScroll: true
    });
  }

  // OK
  function handleWindowResize() {
    const clientWidth = _document.documentElement.clientWidth;
    const clientHeight = _document.documentElement.clientHeight;

    if (clientWidth !== scr_Width || clientHeight !== scr_Height) {
      scr_Width = clientWidth;
      scr_Height = clientHeight;

      const innerWidth = _window.innerWidth;
      const mastheadHeight = Number.isInteger(ytdApp?.mastheadHeight) ? ytdApp.mastheadHeight : 56;
      const chatWidth = _document.querySelector("ytd-live-chat-frame#chat")?.clientWidth || 402;

      let adjustedHeight = mastheadHeight;
      if (settings.controlvolume && !settings.controlvolumemousebutton || settings.controlbar.active && settings.controlbar.position === "fixed" && !settings.controlbar.autohide) {
        adjustedHeight += 40;
      }

      const aspectRatioHeight = parseInt((clientHeight - adjustedHeight) * g_videoAspectRatio, 10);
      const aspectRatioWidth = parseInt(clientWidth / g_videoAspectRatio, 10);

      let videoHeight, videoWidth, viewportHeight, viewportWidth;
      if (aspectRatioHeight > clientWidth) {
        videoHeight = clientWidth;
        videoWidth = parseInt(videoHeight / g_videoAspectRatio, 10);
        viewportHeight = videoHeight;
        viewportWidth = videoWidth;
        Ba = false;
      } else {
        videoHeight = parseInt(clientHeight - adjustedHeight, 10);
        videoWidth = parseInt(videoHeight * g_videoAspectRatio, 10);
        viewportHeight = parseInt((clientHeight - 2 * mastheadHeight) * g_videoAspectRatio, 10);
        viewportWidth = clientHeight;
        Ba = true;
      }

      const chatAdjustedWidth = clientWidth - chatWidth;
      const chatAdjustedHeight = parseInt(chatAdjustedWidth / g_videoAspectRatio, 10);
      if (chatAdjustedHeight > videoHeight) {
        chatAdjustedWidth = videoWidth;
        chatAdjustedHeight = videoHeight;
      }

      const innerAdjustedHeight = parseInt(innerWidth / g_videoAspectRatio, 10);
      const leftMargin = parseInt((clientWidth - videoWidth) / 2, 10);
      const innerLeftMargin = parseInt((clientWidth - innerWidth) / 2, 10);
      const viewportLeftMargin = parseInt((clientWidth - viewportHeight) / 2, 10);

      const styles = `
body.efyt-wide-player ytd-watch-flexy:not([fullscreen])[full-bleed-player] #full-bleed-container,
body.efyt-wide-player ytd-watch-grid:not([fullscreen])[full-bleed-player] #player-full-bleed-container,
body.efyt-wide-player ytd-watch-flexy:not([fullscreen])[full-bleed-player] #player-full-bleed-container,
body.efyt-wide-player:not(.efyt-mini-player) ytd-watch-grid:not([fullscreen])[theater] #movie_player video.html5-main-video,
body.efyt-wide-player:not(.efyt-mini-player) ytd-watch-flexy:not([fullscreen])[theater] #movie_player video.html5-main-video,
body.efyt-wide-player:not(.efyt-mini-player) ytd-watch-grid:not([fullscreen])[theater] #movie_player .ytp-iv-video-content,
body.efyt-wide-player:not(.efyt-mini-player) ytd-watch-flexy:not([fullscreen])[theater] #movie_player .ytp-iv-video-content {
  height:${videoHeight}px !important;
}
body.efyt-wide-player ytd-watch-flexy:not([fullscreen])[full-bleed-player][fixed-panels][watch-while-panels-active] #full-bleed-container,
body.efyt-wide-player ytd-watch-flexy:not([fullscreen])[full-bleed-player][fixed-panels][watch-while-panels-active] #player-full-bleed-container,
body.efyt-wide-player:not(.efyt-mini-player) ytd-watch-flexy:not([fullscreen])[theater][fixed-panels][watch-while-panels-active] #movie_player video.html5-main-video,
body.efyt-wide-player:not(.efyt-mini-player) ytd-watch-flexy:not([fullscreen])[theater][fixed-panels][watch-while-panels-active] #movie_player .ytp-iv-video-content {
  height:${chatAdjustedHeight}px !important;
}
body.efyt-wide-player.efyt-viewport ytd-watch-flexy:not([fullscreen]):not([fixed-panels]):not([watch-while-panels-active])[full-bleed-player] #full-bleed-container,
body.efyt-wide-player.efyt-viewport ytd-watch-grid:not([fullscreen])[full-bleed-player] #player-full-bleed-container,
body.efyt-wide-player.efyt-viewport ytd-watch-flexy:not([fullscreen]):not([fixed-panels]):not([watch-while-panels-active])[full-bleed-player] #player-full-bleed-container,
body.efyt-wide-player.efyt-viewport:not(.efyt-mini-player) ytd-watch-grid:not([fullscreen])[theater] #movie_player video.html5-main-video,
body.efyt-wide-player.efyt-viewport:not(.efyt-mini-player) ytd-watch-flexy:not([fullscreen]):not([fixed-panels]):not([watch-while-panels-active])[theater] #movie_player video.html5-main-video,
body.efyt-wide-player.efyt-viewport:not(.efyt-mini-player) ytd-watch-grid:not([fullscreen])[theater] #movie_player .ytp-iv-video-content,
body.efyt-wide-player.efyt-viewport:not(.efyt-mini-player) ytd-watch-flexy:not([fullscreen]):not([fixed-panels]):not([watch-while-panels-active])[theater] #movie_player .ytp-iv-video-content {
  height:${viewportWidth}px !important;
}
body.efyt-wide-player:not(.efyt-mini-player) ytd-watch-grid:not([fullscreen])[theater] #movie_player video.html5-main-video,
body.efyt-wide-player:not(.efyt-mini-player) ytd-watch-flexy:not([fullscreen])[theater] #movie_player video.html5-main-video,
body.efyt-wide-player:not(.efyt-mini-player) ytd-watch-grid:not([fullscreen])[theater] #movie_player .ytp-iv-video-content,
body.efyt-wide-player:not(.efyt-mini-player) ytd-watch-flexy:not([fullscreen])[theater] #movie_player .ytp-iv-video-content {
  width:${videoWidth}px !important;
  left:${leftMargin}px !important;
}
body.efyt-wide-player:not(.efyt-mini-player) ytd-watch-flexy:not([fullscreen])[theater][fixed-panels][watch-while-panels-active] #movie_player video.html5-main-video,
body.efyt-wide-player:not(.efyt-mini-player) ytd-watch-flexy:not([fullscreen])[theater][fixed-panels][watch-while-panels-active] #movie_player .ytp-iv-video-content {
  width:${chatAdjustedWidth}px !important;
  left:50% !important;
  transform:translateX(-50%) !important;
}
body.efyt-wide-player.efyt-viewport:not(.efyt-mini-player) ytd-watch-grid:not([fullscreen])[theater] #movie_player video.html5-main-video,
body.efyt-wide-player.efyt-viewport:not(.efyt-mini-player) ytd-watch-flexy:not([fullscreen]):not([fixed-panels]):not([watch-while-panels-active])[theater] #movie_player video.html5-main-video,
body.efyt-wide-player.efyt-viewport:not(.efyt-mini-player) ytd-watch-grid:not([fullscreen])[theater] #movie_player .ytp-iv-video-content,
body.efyt-wide-player.efyt-viewport:not(.efyt-mini-player) ytd-watch-flexy:not([fullscreen]):not([fixed-panels]):not([watch-while-panels-active])[theater] #movie_player .ytp-iv-video-content {
  width:${viewportHeight}px !important;
  left:${viewportLeftMargin}px !important;
}
body.efyt-cinema-mode.efyt-wide-player ytd-watch-flexy:not([fullscreen])[full-bleed-player] #full-bleed-container,
body.efyt-cinema-mode.efyt-wide-player ytd-watch-grid:not([fullscreen])[full-bleed-player] #player-full-bleed-container,
body.efyt-cinema-mode.efyt-wide-player ytd-watch-flexy:not([fullscreen])[full-bleed-player] #player-full-bleed-container,
body.efyt-cinema-mode.efyt-wide-player ytd-watch-grid:not([fullscreen])[theater] #movie_player video.html5-main-video,
body.efyt-cinema-mode.efyt-wide-player ytd-watch-flexy:not([fullscreen])[theater] #movie_player video.html5-main-video,
body.efyt-cinema-mode.efyt-wide-player ytd-watch-grid:not([fullscreen])[theater] #movie_player .ytp-iv-video-content,
body.efyt-cinema-mode.efyt-wide-player ytd-watch-flexy:not([fullscreen])[theater] #movie_player .ytp-iv-video-content {
  height:${innerAdjustedHeight}px !important;
}
body.efyt-cinema-mode.efyt-wide-player ytd-watch-grid:not([fullscreen])[theater] #movie_player video.html5-main-video,
body.efyt-cinema-mode.efyt-wide-player ytd-watch-flexy:not([fullscreen])[theater] #movie_player video.html5-main-video,
body.efyt-cinema-mode.efyt-wide-player ytd-watch-grid:not([fullscreen])[theater] #movie_player .ytp-iv-video-content,
body.efyt-cinema-mode.efyt-wide-player ytd-watch-flexy:not([fullscreen])[theater] #movie_player .ytp-iv-video-content {
  width:${innerWidth}px !important;
  left:${innerLeftMargin}px !important;
}`;

      if (StyleElement) {
        StyleElement.textContent = styles;
      } else {
        StyleElement = _document.createElement("style");
        StyleElement.textContent = styles;
        _document.head.appendChild(StyleElement);
      }

      if (_document.body.classList.contains("efyt-wide-player")) {
        _window.removeEventListener("resize", onWindowResize);
        _window.dispatchEvent(new Event("resize"));
        _window.addEventListener("resize", onWindowResize);
      }
    }
  }

  // OK
  function updateControlStyles() {
    const buttonCount = _document.querySelectorAll(".ytp-right-controls .ytp-efyt-button:not(#efyt-controls-button):not([hidden])").length;
    const styles = `
      html:not(.efyt-controls-visible) .ytp-small-mode #ytp-efyt-controls.visible,
      html:not(.efyt-controls-visible) .ytp-small-mode #ytp-efyt-controls:hover {
      max-width: ${36 * buttonCount + 36}px;
      }
      html:not(.efyt-controls-visible) #ytp-efyt-controls.visible,
      html:not(.efyt-controls-visible) #ytp-efyt-controls:hover {
      max-width: ${48 * buttonCount + 48}px;
      }
      html:not(.efyt-controls-visible) .ytp-big-mode #ytp-efyt-controls.visible,
      html:not(.efyt-controls-visible) .ytp-big-mode #ytp-efyt-controls:hover,
      html:not(.efyt-controls-visible) .ytp-fullscreen #ytp-efyt-controls.visible,
      html:not(.efyt-controls-visible) .ytp-fullscreen #ytp-efyt-controls:hover {
      max-width: ${54 * buttonCount + 54}px;
      }
    `;
    const styleElement = _document.createElement("style");
    styleElement.textContent = styles;
    _document.head.appendChild(styleElement);
  }

  // OK
  function disableAnnotationsModule() {
    moviePlayer.efytAnnotationsModuleUnloaded = true;
    moviePlayer.classList.add("efyt-annotations-module-unloaded");
    let a, b;
    null == (b = (a = moviePlayer).unloadModule) || b.call(a, "annotations_module");
    updateEndScreenButtonIcons("off");
  }

  // OK
  function enableAnnotationsModule() {
    moviePlayer.efytAnnotationsModuleUnloaded = undefined;
    moviePlayer.classList.remove("efyt-annotations-module-unloaded");
    let a, b;
    null == (b = (a = moviePlayer).loadModule) || b.call(a, "annotations_module");
    updateEndScreenButtonIcons("on");
  }

  // OK
  function updateEndScreenButtonIcons(state) {
    if (controlsBar && videoPlaybackController) {
      const buttons = videoPlaybackController.querySelectorAll("button#efyt-cards-end-screens");
      buttons.forEach(button => {
        const path = button.querySelector("path");
        path.setAttributeNS(null, "d", button.dataset[state]);
      });
    }
  }

  // OK
  function handleMouseOver(a) {
    a.preventDefault();
    a.stopPropagation();
    /speed/.test(this.id) ? ytdControlTooltip.textContent = `${this.dataset.tooltip} (${currentPlaybackRate}x)` : ytdControlTooltip.textContent = this.dataset.tooltip;
    ytdControlTooltip.style.left = this.offsetLeft + this.clientWidth / 2 + "px";
    ytdControlTooltip.classList.add("visible");
  }

  // OK
  function handleMouseOut(a) {
    a.preventDefault();
    a.stopPropagation();
    ytdControlTooltip.classList.remove("visible");
  }

  // OK
  function showTooltipOnHover() {
    settingsButtons.dispatchEvent(new Event("mouseover"));
    settingsButtons.dispatchEvent(new Event("mouseout"));
    tooltipNode || (tooltipNode = moviePlayer.querySelector(".ytp-tooltip:not(.ytp-efyt-tooltip)"));
    if (tooltipNode && tooltipNode.style.top !== "") {
      ytTooltipText.textContent = /speed/.test(this.id) ? `${this.dataset.tooltip} (${currentPlaybackRate}x)` : this.dataset.tooltip;
      ytpTooltipWrapper.style.display = "block";
      ytpTooltipWrapper.style.top = tooltipNode.style.top;
      const offsetLeft = this.parentNode.parentNode.parentNode.offsetLeft;
      const parentOffsetLeft = this.parentNode.parentNode.parentNode.parentNode.offsetLeft;
      const tooltipLeft = "ytp-efyt-controls" === this.parentNode.id ? parentOffsetLeft : offsetLeft;
      ytpTooltipWrapper.style.left = `${tooltipLeft + this.offsetLeft + this.offsetWidth / 2 - ytpTooltipWrapper.getBoundingClientRect().width / 2}px`;
    }
  }

  // OK
  function hideTooltip() {
    ytpTooltipWrapper && (ytpTooltipWrapper.style.display = "none");
  }


  // OK
  function generateButtonElementInner(a, b, e) {
    var e_button = _document.createElement("button"),
      e_svg = _document.createElementNS("http://www.w3.org/2000/svg", "svg"),
      e_svg_path = _document.createElementNS("http://www.w3.org/2000/svg", "path");
    "reverse-playlist" === a ? settings.controls.includes(a) && 0 < _document.location.href.indexOf("list=") ? e_button.hidden = false : e_button.hidden = true : e_button.hidden = -1 !== settings.controls.indexOf(a) ? false : true;
    e_svg.setAttributeNS(null, "version", "1.1");
    e_svg.setAttributeNS(null, "viewBox", "0 0 36 36");
    e_svg.setAttributeNS(null, "height", "100%");
    e_svg.setAttributeNS(null, "width", "100%");
    e_svg_path.setAttributeNS(null, "id", "efyt-" + a);
    e_svg_path.setAttributeNS(null, "d", b);
    e_svg_path.setAttributeNS(null, "fill", "var(--efyt-control-bar-color)");
    e && e_svg_path.setAttributeNS(null, "transform", e);
    e_svg.appendChild(e_svg_path);
    e_button.appendChild(e_svg);
    e_button.addEventListener("mouseover", handleMouseOver, true);
    e_button.addEventListener("mouseout", handleMouseOut, true);
    e_button.addEventListener("click", function () {
      this.blur();
    });
    return e_button;
  }

  // OK
  function generateButtonElement(a, b, e) {
    var e_button = _document.createElement("button"),
      e_svg_use = _document.createElementNS("http://www.w3.org/2000/svg", "use"),
      e_svg = _document.createElementNS("http://www.w3.org/2000/svg", "svg"),
      e_svg_path = _document.createElementNS("http://www.w3.org/2000/svg", "path");
    e_button.className = "ytp-button ytp-efyt-button";
    "reverse-playlist" === a ? settings.controls.includes(a) && 0 < _document.location.href.indexOf("list=") ? e_button.hidden = false : e_button.hidden = true : e_button.hidden = -1 !== settings.controls.indexOf(a) ? false : true;
    e_svg.setAttributeNS(null, "version", "1.1");
    e_svg.setAttributeNS(null, "viewBox", "0 0 36 36");
    e_svg.setAttributeNS(null, "height", "100%");
    e_svg.setAttributeNS(null, "width", "100%");
    e_svg_use.setAttribute("class", securityPolicy.createScript("ytp-svg-shadow"));
    e_svg_use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#ytp-efyt-" + a);
    e_svg_path.setAttributeNS(null, "id", "ytp-efyt-" + a);
    e_svg_path.setAttributeNS(null, "d", b);
    e_svg_path.setAttributeNS(null, "fill", "#fff");
    e && e_svg_path.setAttributeNS(null, "transform", e);
    e_svg.appendChild(e_svg_use);
    e_svg.appendChild(e_svg_path);
    e_button.appendChild(e_svg);
    e_button.addEventListener("mouseover", showTooltipOnHover);
    e_button.addEventListener("mouseout", hideTooltip);
    a = generateButtonElementInner(a, b, e);
    return [e_button, a];
  }

  // OK
  function onClickLoop() {
    loopControlPanel ? loopControlPanel.hidden ? showLoopControl() : hideLoopControl() : (initLoopInterface(), showLoopControl());
    wakeUpMoviePlayerControls();
  }

  // OK
  function ctxLoop(a) {
    a.preventDefault();
    a.stopPropagation();
    a = parseInt(moviePlayer.getCurrentTime(), 10);
    loopControlPanel ? loopControlPanel.hidden ? showLoopControl(a) : hideLoopControl() : (initLoopInterface(), showLoopControl(a));
    wakeUpMoviePlayerControls();
    return false;
  }

  // OK
  function updateVideoThumbnail() {
    try {
      const videoId = moviePlayer.getVideoData().video_id;
      const thumbnailUrl = `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`;
      const cuedThumbnailOverlay = moviePlayer.querySelector(".ytp-cued-thumbnail-overlay");

      if (cuedThumbnailOverlay) {
        cuedThumbnailOverlay.style.backgroundImage = thumbnailUrl;
        cuedThumbnailOverlay.style.backgroundSize = "100% 100%";
        cuedThumbnailOverlay.style.cursor = "pointer";
        cuedThumbnailOverlay.style.display = "";
        moviePlayer.hideCuedThumbnailOverlay = true;
      } else {
        moviePlayer.style.backgroundImage = thumbnailUrl;
        moviePlayer.style.backgroundSize = "100% 100%";
        moviePlayer.style.cursor = "pointer";
        moviePlayer.removeBackgroundImage = true;
      }
    } catch (error) {
      console.error("Error setting thumbnail overlay:", error);
    }
  }

  // OK
  function onclickStopVideoPlayback() {
    moviePlayer.stopVideo();
    updateVideoThumbnail();
    moviePlayer.enhance = true;
  }

  // OK
  function onClickReversePL() {
    handlePlaylistChange(true, false);
  }

  // OK
  function ctxReversePL(a) {
    a.preventDefault();
    a.stopPropagation();
    handlePlaylistChange(true, true);
    return false;
  }

  // OK
  function configureAudioGain() {
    if (!gainControl) {
      var audioContext = new _window.AudioContext,
        mediaElementSource = audioContext.createMediaElementSource(videoObject);
      gainControl = audioContext.createGain();
      mediaElementSource.connect(gainControl);
      gainControl.connect(audioContext.destination);
    }
    gainControl.gain.value = 1 === gainControl.gain.value ? settings.volumemultiplier : 1;
  }

  // OK
  function onClickVolumeBooster() {
    if (videoObject) {
      configureAudioGain();
      const buttons = ytdApp.querySelectorAll("button#efyt-volume-booster");
      buttons.forEach(button => {
        const path = button.querySelector("path");
        if (button.classList.contains("active")) {
          button.classList.remove("active");
          path.setAttributeNS(null, "d", button.dataset.off);
        } else {
          button.classList.add("active");
          path.setAttributeNS(null, "d", button.dataset.on);
        }
      });
    }
  }

  // OK
  function onClickCardsOS() {
    const isAnnotationsModuleUnloaded = moviePlayer.efytAnnotationsModuleUnloaded;
    moviePlayer.efytAnnotationsModuleUnloaded = !isAnnotationsModuleUnloaded;
    moviePlayer.classList.toggle("efyt-annotations-module-unloaded", !isAnnotationsModuleUnloaded);

    const moduleAction = isAnnotationsModuleUnloaded ? "loadModule" : "unloadModule";
    const moduleState = isAnnotationsModuleUnloaded ? "on" : "off";

    moviePlayer[moduleAction]?.("annotations_module");
    updateEndScreenButtonIcons(moduleState);
  }

  // OK
  function onClickCinemaMode() {
    _document.body.classList.contains("efyt-cinema-mode") ? exitCinemaMode() : enterCinemaMode();
  }

  // OK
  function onClickPlayerSize() {
    if (!_document.body.classList.contains("efyt-wide-player") || !_document.body.classList.contains("efyt-mini-player")) {
      if (_document.body.classList.contains("efyt-mini-player")) {
        _document.body.classList.remove("efyt-mini-player");
        _window.scrollTo(0, 0);
      }
      adjustPlaybackScreen();
    }
  }

  // OK
  function ctxPlayerSize(event) {
    event.preventDefault();
    event.stopPropagation();
    const scrollToY = _document.body.classList.contains("efyt-viewport")
      ? (Number.isInteger(ytdApp.mastheadHeight) ? ytdApp.mastheadHeight : 56)
      : 0;
    _window.scrollTo(_window.scrollX, scrollToY);
    return false;
  }

  // OK
  function onClickPopupPlayer() {
    handleVideoPlayback(false);
  }

  // OK
  function ctxClickPopupPlayer(a) {
    a.preventDefault();
    a.stopPropagation();
    handleVideoPlayback(true);
    return false;
  }

  // OK
  function updatePlaybackSpeedMinus() {
    modifyPlaybackSpeed({
      deltaY: settings.reversemousewheeldirection ? -1 : 1,
      preventDefault: function () { },
      stopPropagation: function () { }
    });
    ytTooltipText.textContent = `${F.speed} (${currentPlaybackRate}x)`;
    ytdControlTooltip.textContent = `${F.speed} (${currentPlaybackRate}x)`;
  }

  // OK
  function updatePlaybackSpeedDefault(a) {
    setPlaybackRate(a);
    ytTooltipText.textContent = `${F.speed} (${currentPlaybackRate}x)`;
    ytdControlTooltip.textContent = `${F.speed} (${currentPlaybackRate}x)`;
  }

  // OK
  function updatePlaybackSpeedWheel(a) {
    modifyPlaybackSpeed(a);
    ytTooltipText.textContent = `${F.speed} (${currentPlaybackRate}x)`;
    ytdControlTooltip.textContent = `${F.speed} (${currentPlaybackRate}x)`;
  }

  // OK
  function setDefaultPlaybackSpeed(a) {
    a.preventDefault();
    a.stopPropagation();
    currentPlaybackRate = 1;
    if (settings.overridespeeds) videoObject.playbackRate = 1;
    else {
      let b, e;
      null == (e = (b = moviePlayer).setPlaybackRate) || e.call(b, 1);
    }
    PlaybackRateText.textContent = "1x";
    displayPlaybackRateTemporarily();
    ytTooltipText.textContent = `${F.speed} (1x)`;
    ytdControlTooltip.textContent = `${F.speed} (1x)`;
    moviePlayer.efytPlaybackRate = 1;
  }

  // OK
  function updatePlaybackSpeedPlus() {
    modifyPlaybackSpeed({
      deltaY: settings.reversemousewheeldirection ? 1 : -1,
      preventDefault: function () { },
      stopPropagation: function () { }
    });
    ytTooltipText.textContent = `${F.speed} (${currentPlaybackRate}x)`;
    ytdControlTooltip.textContent = `${F.speed} (${currentPlaybackRate}x)`;
  }

  // OK
  function showVideoFilters() {
    if (filtersContainer) {
      filtersContainer.classList.toggle("hidden");
      filtersContainer.hidden = !filtersContainer.hidden;
      videoObject.style.filter = filtersContainer.hidden ? "" : settings.filter;
      if (!settings.controlbar.active) {
        this.focus();
      }
    } else {
      createVideoFiltersPanel();
    }
    wakeUpMoviePlayerControls();
  }

  // OK
  function ctxVideoFilters(a) {
    a.preventDefault();
    a.stopPropagation();
    filtersContainer && filtersContainer.classList.toggle("hidden");
    return false;
  }

  // OK
  function toggleButtonClass() {
    moviePlayer.classList.toggle(this.id);
  }

  // OK
  function captureVideoScreenshot() {
    if (isVideoAvailable && moviePlayer && videoObject) {
      var canvasElement = _document.createElement("canvas"),
        b = canvasElement.getContext("2d"),
        e = videoObject.clientWidth,
        g = videoObject.clientHeight,
        l = (h => {
          var k = Math.floor(h / 3600),
            m = Math.floor(h % 3600 / 60);
          h = Math.floor(h % 3600 % 60);
          return (0 < k ? k + "h" : "") + (0 < m ? (0 < k && 10 > m ? "0" : "") + m + "m" : 0 < k && 0 === m ? "00m" : "0m") + (10 > h ? "0" : "") + h + "s";
        })(parseInt(moviePlayer.getCurrentTime(), 10));
      canvasElement.width = e;
      canvasElement.height = g;
      b.drawImage(videoObject, 0, 0, e, g);
      canvasElement.toBlob(h => {
        var k, m, q = null == (m = (k = moviePlayer).getVideoData) ? undefined : m.call(k);
        k = null == q ? undefined : q.author.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, " ").trim();
        m = null == q ? undefined : q.title.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, " ").trim();
        q = null == q ? undefined : q.video_id;
        var M = _document.createElement("a");
        M.href = URL.createObjectURL(h);
        M.download = `${k} - ${m} [${q} - ${e}x${g} - ${l}].png`;
        M.click();
        URL.revokeObjectURL(M.href);
      });
    }
  }

  // OK
  function onClickOptions() {
    _document.dispatchEvent(new CustomEvent("efyt-message", {
      detail: {
        request: "options-page"
      }
    }));
  }

  // OK
  function ctxPreventContextMenu(a) {
    a.preventDefault();
    a.stopPropagation();
    return false;
  }

  // OK
  function updateFilterSettings(slider) {
    clearTimeout(tmpFun_windowResize);
    settings.videofilters[slider.name] = Number(slider.value);
    slider.nextElementSibling.textContent = settings.videofilters[slider.name];

    const filters = [];
    const { blur, brightness, contrast, grayscale, rotation, inversion, saturation, sepia } = settings.videofilters;

    if (blur > 0) filters.push(`blur(${blur}px)`);
    if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
    if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
    if (grayscale > 0) filters.push(`grayscale(${grayscale}%)`);
    if (rotation > 0) filters.push(`hue-rotate(${rotation}deg)`);
    if (inversion > 0) filters.push(`invert(${inversion}%)`);
    if (saturation !== 100) filters.push(`saturate(${saturation}%)`);
    if (sepia > 0) filters.push(`sepia(${sepia}%)`);

    settings.filter = filters.length > 0 ? filters.join(" ") : "none";
    videoObject.style.filter = settings.filter;

    tmpFun_windowResize = setTimeout(() => {
      _document.dispatchEvent(new CustomEvent("efyt-video-filters", {
        detail: {
          filter: settings.filter,
          videofilters: settings.videofilters
        }
      }));
    }, 500);
  }

  // OK
  function buildInputSlider(sliderElement, inputName, minValue, maxValue, stepSize, defaultValue, sliderContainer) {
    var name = _document.createElement("label");
    name.setAttribute("for", securityPolicy.createScript(inputName));
    name.dataset.message = sliderElement;
    name.textContent = F[sliderElement];
    sliderElement = _document.createElement("input");
    sliderElement.type = "range";
    sliderElement.id = sliderElement.name = inputName;
    sliderElement.min = minValue;
    sliderElement.max = maxValue;
    sliderElement.step = stepSize;
    sliderElement.dataset.default = defaultValue;
    sliderElement.value = sliderContainer;
    sliderElement.addEventListener("keydown", function (event) {
      event.stopPropagation();
      wakeUpMoviePlayerControls();
      "ArrowRight" === event.key ? this.value = Number(this.value) + Number(this.step) : "ArrowLeft" === event.key && (this.value = Number(this.value) - Number(this.step));
    });
    sliderElement.addEventListener("input", function () {
      this.style.background = `linear-gradient(to right, var(--efyt-accent-color, var(--main-color, #f00)) 0%, var(--efyt-accent-color, var(--main-color, #f00)) ${100 / this.max * this.value}%, #fff ${100 / this.max * this.value}%, #fff 100%)`;
      updateFilterSettings(this);
    });
    sliderElement.style.background = `linear-gradient(to right, var(--efyt-accent-color, var(--main-color, #f00)) 0%, var(--efyt-accent-color, var(--main-color, #f00)) ${100 / maxValue * sliderContainer}%, #fff ${100 / maxValue * sliderContainer}%, #fff 100%)`;
    inputName = _document.createElement("span");
    inputName.textContent = sliderContainer;
    sliderContainer = _document.createElement("div");
    sliderContainer.className = "efyt-video-filter";
    sliderContainer.appendChild(name);
    sliderContainer.appendChild(sliderElement);
    sliderContainer.appendChild(inputName);
    return sliderContainer;
  }

  // OK
  function createVideoFiltersPanel() {
    filtersContainer = _document.createElement("div");
    filtersContainer.id = "efyt-video-filters-panel";
    filtersContainer.hidden = false;
    filtersContainer.addEventListener("mousemove", wakeUpMoviePlayerControls);
    var filterSliders = [],
      slider = buildInputSlider("gaussian_blur", "blur", 0, 50, 1, 0, settings.videofilters.blur);
    filtersContainer.appendChild(slider);
    filterSliders.push(slider);
    slider = buildInputSlider("brightness", "brightness", 0, 200, 1, 100, settings.videofilters.brightness);
    filtersContainer.appendChild(slider);
    filterSliders.push(slider);
    slider = buildInputSlider("contrast", "contrast", 0, 200, 1, 100, settings.videofilters.contrast);
    filtersContainer.appendChild(slider);
    filterSliders.push(slider);
    slider = buildInputSlider("grayscale", "grayscale", 0, 100, 1, 0, settings.videofilters.grayscale);
    filtersContainer.appendChild(slider);
    filterSliders.push(slider);
    slider = buildInputSlider("hue_rotation", "rotation", 0, 360, 1, 0, settings.videofilters.rotation);
    filtersContainer.appendChild(slider);
    filterSliders.push(slider);
    slider = buildInputSlider("color_inversion", "inversion", 0, 100, 1, 0, settings.videofilters.inversion);
    filtersContainer.appendChild(slider);
    filterSliders.push(slider);
    slider = buildInputSlider("saturation", "saturation", 0, 200, 1, 100, settings.videofilters.saturation);
    filtersContainer.appendChild(slider);
    filterSliders.push(slider);
    slider = buildInputSlider("sepia", "sepia", 0, 100, 1, 0, settings.videofilters.sepia);
    filtersContainer.appendChild(slider);
    filterSliders.push(slider);
    slider = _document.createElement("button");
    slider.dataset.message = "reset";
    slider.textContent = F.reset;
    slider.addEventListener("click", e => {
      e.preventDefault();
      filterSliders.forEach(g => {
        g = g.querySelector("input");
        g.value = g.dataset.default;
        g.dispatchEvent(new Event("input"));
      });
    });
    filtersContainer.appendChild(slider);
    (slider = moviePlayer.querySelector(".ytp-chrome-top")) && slider.appendChild(filtersContainer);
    videoObject.style.filter = settings.filter;
  }

  // OK
  function onClickKeyboardShortcuts() {
    _document.dispatchEvent(new CustomEvent("efyt-message", {
      detail: {
        request: "keyboard-shortcuts"
      }
    }));
  }

  // OK
  function wakeUpMoviePlayerControls() {
    let player, wakeUpMethod;
    null == (player = moviePlayer) || null == (wakeUpMethod = player.wakeUpControls) || wakeUpMethod.call(player);
  }

  // OK
  function handleVideoSeek() {
    Qa || moviePlayer.classList.contains("ad-interrupting") || !(videoObject.currentTime >= Hb - 0.2 || videoObject.currentTime < minimumSeekTime) || moviePlayer.seekTo(minimumSeekTime);
  }

  // OK
  function durationInSecondsToHMS(a) {
    return {
      h: Math.floor(a / 3600),
      m: Math.floor(a % 3600 / 60),
      s: Math.floor(a % 3600 % 60)
    };
  }

  // OK
  function updateLoopStartTime() {
    const startHours = Number(loopStartInput.value);
    const startMinutes = Number(t.value);
    const startSeconds = Number(y.value);
    const endHours = Number(loopEndInput.value);
    const endMinutes = Number(endMinutesInput.value);
    const endSeconds = Number(loopEndSeconds.value);

    if (this.name === "start-hours") {
      if (startHours === endHours && endMinutes === 0 && endSeconds === 0) {
        loopStartInput.value = startHours - 1;
        t.value = 59;
        y.value = 59;
      } else {
        t.value = 0;
        y.value = 0;
      }
    } else if (this.name === "start-minutes") {
      if (startMinutes === -1) {
        if (startHours > 0) {
          loopStartInput.value = startHours - 1;
          t.value = 59;
        } else {
          loopStartInput.value = 0;
          t.value = 0;
        }
      } else if (startMinutes === 60) {
        if (startHours < endHours) {
          loopStartInput.value = startHours + 1;
          t.value = 0;
        } else {
          loopStartInput.value = endHours;
        }
      }
      y.value = 0;
      if (startMinutes === endMinutes && endSeconds === 0) {
        t.value = startMinutes - 1;
        y.value = 59;
      }
    } else if (this.name === "start-seconds") {
      if (startSeconds === -1) {
        if (startMinutes > 0) {
          t.value = startMinutes - 1;
          y.value = 59;
        } else if (startMinutes === 0 && startHours > 0) {
          loopStartInput.value = startHours - 1;
          t.value = 59;
          y.value = 59;
        } else {
          y.value = 0;
        }
      } else if (startSeconds === 60) {
        if (startMinutes === 59) {
          loopStartInput.value = startHours + 1;
          if (loopStartInput.value > endHours) {
            loopStartInput.value = endHours;
            t.value = 59;
            y.value = 59;
          } else {
            t.value = 0;
            y.value = 0;
          }
        } else if (startHours === endHours && startMinutes === endMinutes) {
          y.value = 59;
        } else {
          t.value = startMinutes + 1;
          y.value = 0;
        }
      }
    }

    minimumSeekTime = 3600 * Number(loopStartInput.value) + 60 * Number(t.value) + Number(y.value);
    SetLoopBoundaries();
    wakeUpMoviePlayerControls();
    if (!Qa) moviePlayer.seekTo(minimumSeekTime);
  }

  // OK
  function updateLoopEndTime() {
    const endTime = durationInSecondsToHMS(videoDurationInSeconds);
    const startHours = Number(loopStartInput.value);
    const startMinutes = Number(t.value);
    const startSeconds = Number(y.value);
    const endHours = Number(loopEndInput.value);
    const endMinutes = Number(endMinutesInput.value);
    const endSeconds = Number(loopEndSeconds.value);

    if (this.name === "end-hours") {
      if (endHours === startHours && endMinutes === startMinutes && endSeconds === startSeconds) {
        endMinutesInput.value = startMinutes;
        loopEndSeconds.value = startSeconds + 1;
      } else {
        endMinutesInput.value = 0;
        loopEndSeconds.value = 0;
      }
    } else if (this.name === "end-minutes") {
      if (endMinutes === -1) {
        if (endHours > startHours) {
          loopEndInput.value = endHours - 1;
          endMinutesInput.value = 59;
        } else {
          loopEndInput.value = startHours;
          endMinutesInput.value = startMinutes;
        }
      } else if (endMinutes === 60) {
        if (endHours < endTime.h) {
          loopEndInput.value = endHours + 1;
          endMinutesInput.value = 0;
        } else {
          loopEndInput.value = endTime.h;
          endMinutesInput.value = endTime.m;
        }
      }
      loopEndSeconds.value = 0;
      if (endHours === startHours && endMinutes === startMinutes && endSeconds === startSeconds) {
        endMinutesInput.value = startMinutes;
        loopEndSeconds.value = startSeconds + 1;
      }
    } else if (this.name === "end-seconds") {
      if (endSeconds === -1) {
        if (endMinutes > startMinutes) {
          endMinutesInput.value = endMinutes - 1;
          loopEndSeconds.value = 59;
        } else if (endMinutes === startMinutes && endHours > startHours) {
          loopEndInput.value = endHours - 1;
          endMinutesInput.value = 59;
          loopEndSeconds.value = 59;
        } else {
          loopEndSeconds.value = startSeconds;
        }
      } else if (endSeconds === 60) {
        if (endMinutes === 59) {
          loopEndInput.value = endHours + 1;
          if (loopEndInput.value > endTime.h) {
            loopEndInput.value = endTime.h;
            endMinutesInput.value = endTime.m;
            loopEndSeconds.value = endTime.s;
          } else {
            endMinutesInput.value = 0;
            loopEndSeconds.value = 0;
          }
        } else if (endHours === endTime.h && endMinutes === endTime.m) {
          loopEndSeconds.value = endTime.s;
        } else {
          endMinutesInput.value = endMinutes + 1;
          loopEndSeconds.value = 0;
        }
      }
    }

    Hb = 3600 * Number(loopEndInput.value) + 60 * Number(endMinutesInput.value) + Number(loopEndSeconds.value);
    SetLoopBoundaries();
    wakeUpMoviePlayerControls();
  }

  // OK
  function SetLoopBoundaries() {
    const endTime = durationInSecondsToHMS(videoDurationInSeconds);
    const startHours = Number(loopStartInput.value);
    const startMinutes = Number(t.value);
    const startSeconds = Number(y.value);
    const endHours = Number(loopEndInput.value);
    const endMinutes = Number(endMinutesInput.value);
    const endSeconds = Number(loopEndSeconds.value);

    loopStartInput.max = endHours;
    t.min = startHours > 0 ? -1 : 0;
    t.max = (endHours === 0 && startMinutes + 1 === endMinutes && startSeconds === 59 && endSeconds === 0) ? startMinutes :
      (startHours === endHours) ? endMinutes :
        (startHours + 1 === endHours && endMinutes === 0 && endSeconds === 0) ? 59 : 60;
    y.min = (startHours === 0 && startMinutes === 0) ? 0 : -1;
    y.max = (endHours !== 0 && startHours !== endHours) || (startMinutes + 1 !== endMinutes) || (startSeconds !== 59) || (endSeconds !== 0) ?
      (startHours + 1 === endHours && startMinutes === 59 && endMinutes === 0 && startSeconds === 59 && endSeconds === 0) ? 59 :
        (startHours === endHours && startMinutes === endMinutes) ? endSeconds - 1 : 60 : 59;
    loopEndInput.min = (startHours + 1 === endHours && startMinutes === 59 && startSeconds === 59) ? endHours : startHours;
    loopEndInput.max = endTime.h;
    endMinutesInput.min = (endHours === 0 && startMinutes + 1 === endMinutes && startSeconds === 59 && endSeconds === 0) ? endMinutes :
      (startMinutes === 59) ? 0 :
        (startHours === endHours && startMinutes === endMinutes) ? startMinutes : -1;
    endMinutesInput.max = (endHours === endTime.h) ? endTime.m : 60;
    loopEndSeconds.min = (startSeconds === 59) ? 0 :
      (startHours === endHours && startMinutes === endMinutes) ? startSeconds + 1 : -1;
    loopEndSeconds.max = (endHours === endTime.h && endMinutes === endTime.m) ? endTime.s : 60;
  }

  // OK
  function hideLoopControl() {
    videoObject && (videoObject.loop = false, videoObject.removeEventListener("timeupdate", handleVideoSeek), loopControlPanel.hidden = true);
  }

  // OK
  function showLoopControl(startTime) {
    if (videoObject) {
      videoDurationInSeconds = Hb = parseInt(moviePlayer.getDuration(), 10);
      minimumSeekTime = 0;
      const endTime = durationInSecondsToHMS(videoDurationInSeconds);
      if (startTime) {
        const start = durationInSecondsToHMS(startTime);
        loopStartInput.value = start.h;
        t.value = start.m;
        y.value = start.s;
        minimumSeekTime = 3600 * start.h + 60 * start.m + start.s;
      } else {
        loopStartInput.value = 0;
        t.value = 0;
        y.value = 0;
      }
      loopEndInput.value = endTime.h;
      endMinutesInput.value = endTime.m;
      loopEndSeconds.value = endTime.s;
      SetLoopBoundaries();
      if (endTime.h === 0) {
        loopStartInput.parentNode.hidden = loopEndInput.parentNode.hidden = true;
        if (endTime.m === 0) {
          t.parentNode.hidden = endMinutesInput.parentNode.hidden = true;
        }
      } else {
        loopStartInput.parentNode.removeAttribute("hidden");
        loopEndInput.parentNode.removeAttribute("hidden");
        if (endTime.m > 0) {
          t.parentNode.removeAttribute("hidden");
          endMinutesInput.parentNode.removeAttribute("hidden");
        }
      }
      videoObject.addEventListener("timeupdate", handleVideoSeek);
      loopControlPanel.hidden = false;
      if (!moviePlayer.classList.contains("ad-interrupting")) {
        videoObject.loop = true;
      }
      Qa = false;
      loopControlPanel.querySelector(".toggle-checkbox").setAttribute("aria-checked", securityPolicy.createScript("true"));
    }
  }

  // OK
  function initLoopInterface() {
    loopControlPanel = _document.createElement("div");
    loopControlPanel.id = "efyt-loop-panel";
    loopControlPanel.hidden = true;
    loopControlPanel.addEventListener("mousemove", wakeUpMoviePlayerControls);
    var loopEndContainer = _document.createElement("div"),
      loopLabel = _document.createElement("span");
    loopLabel.dataset.message = "loop_start";
    loopLabel.textContent = F.loop_start;
    loopEndContainer.appendChild(loopLabel);
    loopLabel = _document.createElement("label");
    loopLabel.className = "hours";
    loopStartInput = _document.createElement("input");
    loopStartInput.type = "number";
    loopStartInput.name = "start-hours";
    loopStartInput.min = 0;
    loopStartInput.addEventListener("input", updateLoopStartTime);
    loopStartInput.addEventListener("focus", function () {
      this.select();
    });
    loopStartInput.addEventListener("keydown", e => {
      e.stopPropagation();
    }, true);
    loopLabel.appendChild(loopStartInput);
    loopEndContainer.appendChild(loopLabel);
    loopLabel = _document.createElement("label");
    loopLabel.className = "minutes";
    t = _document.createElement("input");
    t.type = "number";
    t.name = "start-minutes";
    t.addEventListener("input", updateLoopStartTime);
    t.addEventListener("focus", function () {
      this.select();
    });
    t.addEventListener("keydown", e => {
      e.stopPropagation();
    }, true);
    loopLabel.appendChild(t);
    loopEndContainer.appendChild(loopLabel);
    loopLabel = _document.createElement("label");
    loopLabel.className = "seconds";
    y = _document.createElement("input");
    y.type = "number";
    y.name = "start-seconds";
    y.addEventListener("input", updateLoopStartTime);
    y.addEventListener("focus", function () {
      this.select();
    });
    y.addEventListener("keydown", e => {
      e.stopPropagation();
    }, true);
    loopLabel.appendChild(y);
    loopEndContainer.appendChild(loopLabel);
    loopControlPanel.appendChild(loopEndContainer);
    loopEndContainer = _document.createElement("div");
    loopLabel = _document.createElement("span");
    loopLabel.dataset.message = "loop_end";
    loopLabel.textContent = F.loop_end;
    loopEndContainer.appendChild(loopLabel);
    loopLabel = _document.createElement("label");
    loopLabel.className = "hours";
    loopEndInput = _document.createElement("input");
    loopEndInput.type = "number";
    loopEndInput.name = "end-hours";
    loopEndInput.addEventListener("input", updateLoopEndTime);
    loopEndInput.addEventListener("focus", function () {
      this.select();
    });
    loopEndInput.addEventListener("keydown", e => {
      e.stopPropagation();
    }, true);
    loopLabel.appendChild(loopEndInput);
    loopEndContainer.appendChild(loopLabel);
    loopLabel = _document.createElement("label");
    loopLabel.className = "minutes";
    endMinutesInput = _document.createElement("input");
    endMinutesInput.type = "number";
    endMinutesInput.name = "end-minutes";
    endMinutesInput.addEventListener("input", updateLoopEndTime);
    endMinutesInput.addEventListener("focus", function () {
      this.select();
    });
    endMinutesInput.addEventListener("keydown", e => {
      e.stopPropagation();
    }, true);
    loopLabel.appendChild(endMinutesInput);
    loopEndContainer.appendChild(loopLabel);
    loopLabel = _document.createElement("label");
    loopLabel.className = "seconds";
    loopEndSeconds = _document.createElement("input");
    loopEndSeconds.type = "number";
    loopEndSeconds.name = "end-seconds";
    loopEndSeconds.addEventListener("input", updateLoopEndTime);
    loopEndSeconds.addEventListener("focus", function () {
      this.select();
    });
    loopEndSeconds.addEventListener("keydown", e => {
      e.stopPropagation();
    }, true);
    loopLabel.appendChild(loopEndSeconds);
    loopEndContainer.appendChild(loopLabel);
    loopControlPanel.appendChild(loopEndContainer);
    loopEndContainer = _document.createElement("div");
    loopEndContainer.className = "toggle-checkbox";
    loopEndContainer.setAttribute("aria-checked", securityPolicy.createScript("true"));
    loopEndContainer.addEventListener("click", function () {
      "true" === this.getAttribute("aria-checked") ? (Qa = true, videoObject.loop = false, this.setAttribute("aria-checked", securityPolicy.createScript("false"))) : (Qa = false, videoObject.loop = true, this.setAttribute("aria-checked", securityPolicy.createScript("true")));
    });
    loopControlPanel.appendChild(loopEndContainer);
    (loopEndContainer = moviePlayer.querySelector(".ytp-chrome-bottom .ytp-progress-bar-container")) && loopEndContainer.insertBefore(loopControlPanel, loopEndContainer.firstChild);
  }

  // OK
  function handleVideoPlayback(a) {
    try {
      var playlist = moviePlayer.getPlaylist();
      if (playlist && 1 < playlist.length) handlePlaylistChange(false, a);
      else {
        moviePlayer.pauseVideo();
        var videoUrlWithAutoplay = moviePlayer.getVideoData().video_id + "?autoplay=1",
          currentPlaybackTime = moviePlayer.getCurrentTime();
        currentPlaybackTime && (videoUrlWithAutoplay += "&start=" + parseInt(currentPlaybackTime, 10));
        _document.dispatchEvent(new CustomEvent("efyt-message", {
          detail: {
            request: "pop-up-player",
            params: videoUrlWithAutoplay,
            playlist: false
          }
        }));
        a && (a(), updateVideoThumbnail());
      }
    } catch (l) { }
  }

  // OK
  function handlePlaylistChange(shouldReversePlaylist, callback) {
    try {
      moviePlayer.pauseVideo();
      let playlist = moviePlayer.getPlaylist();
      if (shouldReversePlaylist) playlist.reverse();
      _document.dispatchEvent(new CustomEvent("efyt-message", {
        detail: {
          request: "pop-up-player",
          params: {
            videos: playlist,
            index: playlist.indexOf(moviePlayer.getVideoData().video_id),
            start: parseInt(moviePlayer.getCurrentTime(), 10)
          },
          playlist: true
        }
      }));
      if (callback) {
        callback();
        updateVideoThumbnail();
      }
    } catch (error) {
      console.error("Error handling playlist change:", error);
    }
  }

  // OK
  function kd(a) {
    if (Q && !Q.classList.contains("ytp-settings-shown") && !Q.classList.contains("ytp-menu-shown") && "INPUT" !== a.target.nodeName) {
      if (a.ctrlKey && settings.controlspeed) {
        a.preventDefault();
        a.stopPropagation();
        try {
          let videoElement = Q.querySelector("video");
          let playbackRate = videoElement.playbackRate;
          if (settings.overridespeeds) {
            if ((settings.reversemousewheeldirection ? a.deltaY < 0 : a.deltaY > 0)) {
              playbackRate = Math.max(playbackRate - settings.speedvariation, settings.speedvariation);
            } else {
              playbackRate += settings.speedvariation;
            }
            videoElement.playbackRate = playbackRate;
          } else {
            let availableRates = Q.getAvailablePlaybackRates();
            let currentRateIndex = availableRates.indexOf(playbackRate);
            if ((settings.reversemousewheeldirection ? a.deltaY < 0 : a.deltaY > 0) && currentRateIndex > 0) {
              playbackRate = availableRates[currentRateIndex - 1];
            } else if ((settings.reversemousewheeldirection ? a.deltaY > 0 : a.deltaY < 0) && currentRateIndex < availableRates.length - 1) {
              playbackRate = availableRates[currentRateIndex + 1];
            }
            Q.setPlaybackRate(playbackRate);
          }
          playbackRateDisplay.textContent = playbackRate + "x";
          clearTimeout(jb);
          playbackRateDisplay.style.display = "block";
          jb = setTimeout(() => {
            playbackRateDisplay.style.display = "none";
          }, 1000);
        } catch (error) {
          console.error("Error adjusting playback speed:", error);
        }
      } else if (!a.ctrlKey && settings.controlvolume) {
        a.preventDefault();
        let volume = Q.getVolume();
        if ((settings.reversemousewheeldirection ? a.deltaY < 0 : a.deltaY > 0)) {
          volume = Math.max(volume - settings.volumevariation, 0);
        } else {
          volume = Math.min(volume + settings.volumevariation, 100);
          if (Q.isMuted()) Q.unMute();
        }
        Q.setVolume(volume);
        playbackRateDisplay.textContent = volume;
        clearTimeout(jb);
        playbackRateDisplay.style.display = "block";
        jb = setTimeout(() => {
          playbackRateDisplay.style.display = "none";
        }, 1000);
      }
    }
  }

  // OK
  function handleVolumeChange(expirationTime) {
    if (isVideoAvailable && !moviePlayer.classList.contains("ytp-settings-shown") && !moviePlayer.classList.contains("ytp-menu-shown") && "INPUT" !== expirationTime.target.nodeName)
      if (expirationTime.ctrlKey && settings.controlspeed && (!settings.controlspeedmousebutton || Aa) && "BUTTON" !== expirationTime.target.nodeName) modifyPlaybackSpeed(expirationTime);
      else if (!(expirationTime.ctrlKey || !settings.controlvolume || settings.controlvolumemousebutton && !Aa || isVideoAvailable && settings.controlbar.active && ("BUTTON" === expirationTime.target.nodeName && expirationTime.target.parentNode.classList.contains("efyt-control-bar") || "svg" === expirationTime.target.nodeName && expirationTime.target.parentNode.parentNode.classList.contains("efyt-control-bar") || "path" === expirationTime.target.nodeName && expirationTime.target.parentNode.parentNode.parentNode.classList.contains("efyt-control-bar")))) {
        expirationTime.preventDefault();
        var currentVolume = moviePlayer.getVolume();
        !settings.reversemousewheeldirection && 0 < expirationTime.deltaY || settings.reversemousewheeldirection && 0 > expirationTime.deltaY ? (currentVolume -= settings.volumevariation, 0 > currentVolume && (currentVolume = 0)) : (currentVolume += settings.volumevariation, 100 < currentVolume && (currentVolume = 100), moviePlayer.isMuted() && moviePlayer.unMute());
        isPlayerUnstarted = moviePlayer.classList.contains("unstarted-mode");
        xa = true;
        moviePlayer.setVolume(currentVolume);
        moviePlayer.efytVolume = currentVolume;
        PlaybackRateText.textContent = currentVolume;
        displayPlaybackRateTemporarily();
        try {
          var currentTime = Date.now();
          expirationTime = currentTime + 31104e6;
          _window.localStorage["yt-player-volume"] = _window.sessionStorage["yt-player-volume"] = JSON.stringify({
            data: JSON.stringify({
              volume: settings.volume,
              muted: 0 < currentVolume ? false : true
            }),
            creation: currentTime,
            expiration: expirationTime
          });
        } catch (g) { }
      }
  }

  // OK
  function modifyPlaybackSpeed(mouseEvent) {
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
    try {
      let mpPlaybackRate = videoObject.playbackRate;
      const deltaY = settings.reversemousewheeldirection ? -mouseEvent.deltaY : mouseEvent.deltaY;
      if (settings.overridespeeds) {
        mpPlaybackRate = parseFloat((mpPlaybackRate + (deltaY > 0 ? -settings.speedvariation : settings.speedvariation)).toFixed(2));
        mpPlaybackRate = Math.max(mpPlaybackRate, settings.speedvariation);
        videoObject.playbackRate = mpPlaybackRate;
      } else {
        const availablePlaybackRates = moviePlayer.getAvailablePlaybackRates();
        const currentRateIndex = availablePlaybackRates.indexOf(mpPlaybackRate);
        const newRateIndex = deltaY > 0 ? currentRateIndex - 1 : currentRateIndex + 1;
        if (newRateIndex >= 0 && newRateIndex < availablePlaybackRates.length) {
          mpPlaybackRate = availablePlaybackRates[newRateIndex];
          moviePlayer.setPlaybackRate(mpPlaybackRate);
        }
      }
      currentPlaybackRate = mpPlaybackRate;
      ya = true;
      PlaybackRateText.textContent = `${mpPlaybackRate}x`;
      displayPlaybackRateTemporarily();
      moviePlayer.efytPlaybackRate = mpPlaybackRate;
    } catch (error) {
      console.error("Error modifying playback speed:", error);
    }
    focusMoviePlayer();
  }

  // OK
  function updateVideoProgress() {
    try {
      ctrl_progress.max = videoObject.duration, ctrl_progress.value = videoObject.currentTime;
    } catch (a) { }
  }

  // OK
  function displayPlaybackRateTemporarily() {
    PlaybackRateText.style.display = "block";
    clearTimeout(tmpFun_playbackRateTimeout);
    tmpFun_playbackRateTimeout = setTimeout(() => {
      PlaybackRateText.style.display = "none";
    }, 1e3);
  }

  // OK
  function setPlaybackRate(a) {
    a.preventDefault();
    currentPlaybackRate = settings.speed;
    if (settings.overridespeeds) videoObject.playbackRate = currentPlaybackRate;
    else {
      let b, e;
      null == (e = (b = moviePlayer).setPlaybackRate) || e.call(b, currentPlaybackRate);
    }
    PlaybackRateText.textContent = currentPlaybackRate + "x";
    displayPlaybackRateTemporarily();
    moviePlayer.efytPlaybackRate = currentPlaybackRate;
    focusMoviePlayer();
  }

  // OK
  function onMouseDownEventHandlerRemove() {
    if (["watch", "channel"].includes(determineYoutubePath())) {
      miniplayerActive = true;
      _document.removeEventListener("mousedown", onMouseDownEventHandlerRemove, true);
      _document.removeEventListener("keydown", onKeyDownEventHandlerRemove, true);
    }
  }

  // OK
  function onKeyDownEventHandlerRemove() {
    if (["watch", "channel"].includes(determineYoutubePath())) {
      miniplayerActive = true;
      _document.removeEventListener("mousedown", onMouseDownEventHandlerRemove, true);
      _document.removeEventListener("keydown", onKeyDownEventHandlerRemove, true);
    }
  }

  // OK
  function onKeyDownEventHandlerRemovalForCinema(event) {
    if (event.key === "Escape" && moviePlayer && !moviePlayer.classList.contains("ytp-fullscreen") && !moviePlayer.classList.contains("ytp-settings-shown")) {
      const contextMenu = _document.querySelector(".ytp-popup.ytp-contextmenu");
      if (!contextMenu || contextMenu.clientHeight === 0) {
        _document.removeEventListener("keydown", onKeyDownEventHandlerRemovalForCinema);
        backdropElement.click();
      }
    }
  }

  // OK
  function handlePlaybackSpeed(event) {
    if (event.ctrlKey && event.shiftKey) {
      setDefaultPlaybackSpeed(event);
    } else if (event.ctrlKey) {
      setPlaybackRate(event);
    }
  }

  // OK
  function onResetPlayerViewIfWide() {
    if (_document.body.classList.contains("efyt-wide-player")) {
      resetPlayerView();
    }
  }

  // OK
  function resetPlayerView() {
    _document.body.classList.remove("efyt-wide-player", "efyt-viewport", "_efyt-viewport_");
    videoPlaybackController && videoPlaybackController.querySelectorAll("button#efyt-size").forEach(a => {
      a.querySelector("path").setAttributeNS(null, "d", a.dataset.expand);
      a.dataset.tooltip = F.expand;
    });
    ytTooltipText.textContent = F.expand;
    ytdControlTooltip.textContent = F.expand;
    _window.scrollTo(0, 0);
  }

  // OK
  function adjustPlaybackScreen(screenModePreference) {
    if (!videoPlaybackManager || !moviePlayer || ytdApp?.fullscreen || ytdApp?.fullscreen_) return;

    try {
      const isWidePlayer = _document.body.classList.contains("efyt-wide-player");
      const shouldExpand = screenModePreference === "large" || (!screenModePreference && !isWidePlayer);

      if (shouldExpand) {
        Mb = videoPlaybackManager.theater && !isWidePlayer;
        const aspectRatio = moviePlayer.getVideoAspectRatio();
        if (aspectRatio !== g_videoAspectRatio) {
          g_videoAspectRatio = aspectRatio;
          scr_Width = scr_Height = undefined;
          handleWindowResize();
        }

        if (!videoPlaybackManager.theater) {
          if (!miniplayerActive && settings.wideplayerviewport && Ba && !_document.body.classList.contains("efyt-cinema-mode")) {
            ytdApp.addEventListener("yt-action", handleScrollOrClosePopup);
          }
          try {
            ytHotkeyManager?.toggleTheaterMode();
          } catch {
            videoPlaybackManager.onTheaterReduxValueUpdate?.(true);
          }
        }

        _document.body.classList.add("efyt-wide-player");
        if (settings.wideplayerviewport && Ba) {
          if (_document.body.classList.contains("efyt-cinema-mode")) {
            _document.body.classList.add("_efyt-viewport_");
          } else {
            _document.body.classList.add("efyt-viewport");
            const mastheadHeight = Number.isInteger(ytdApp.mastheadHeight) ? ytdApp.mastheadHeight : 56;
            _window.scrollTo(_window.scrollX, mastheadHeight);
            if (!miniplayerActive) {
              setTimeout(() => {
                _window.scrollTo(_window.scrollX, mastheadHeight);
                ytdApp.removeEventListener("yt-action", handleScrollOrClosePopup);
              }, 800);
            }
          }
        }

        if (!Mb && !settings.theatermode) {
          setTimeout(() => {
            try {
              _document.cookie = "wide=0;domain=youtube.com;path=/";
            } catch { }
          }, 2000);
        }

        setTimeout(() => {
          if (_document.body.classList.contains("efyt-wide-player")) {
            _document.querySelectorAll("button#efyt-size").forEach(button => {
              button.querySelector("path").setAttributeNS(null, "d", button.dataset.shrink);
              button.dataset.tooltip = F.shrink;
            });
          }
        }, miniplayerActive ? 0 : 1000);

        ytTooltipText.textContent = F.shrink;
        ytdControlTooltip.textContent = F.shrink;
      } else if (screenModePreference === "default" || (!screenModePreference && isWidePlayer)) {
        if (!Mb) {
          try {
            ytHotkeyManager?.toggleTheaterMode();
          } catch {
            videoPlaybackManager.onTheaterReduxValueUpdate?.(false);
          }
          setTimeout(() => {
            if (settings.theatermode) {
              try {
                _document.cookie = "wide=1;domain=youtube.com;path=/";
              } catch { }
            }
          }, 2000);
        }
        resetPlayerView();
      }

      hideTooltip();
      PlaybackRateText.style.display = "none";
    } catch { }

    _window.dispatchEvent(new Event("resize"));
  }

  // OK
  function handleScrollOrClosePopup(event) {
    if (["yt-window-scrolled", "yt-close-popup-action"].includes(event.detail.actionName)) {
      ytdApp.removeEventListener("yt-action", handleScrollOrClosePopup);
      setTimeout(() => {
        const mastheadHeight = Number.isInteger(ytdApp.mastheadHeight) ? ytdApp.mastheadHeight : 56;
        _window.scrollTo(_window.scrollX, mastheadHeight);
      }, 800);
    }
  }

  // OK
  function setVideoPlaybackQuality() {
    const qualityLevels = moviePlayer.getAvailableQualityLevels();
    let selectedQuality = _document.location.href.includes("list=") ? settings.qualityplaylists : settings.qualityvideos;

    if ((ytdApp?.fullscreen || ytdApp?.fullscreen_) && settings.selectqualityfullscreenon) {
      selectedQuality = _document.location.href.includes("list=") ? settings.qualityplaylistsfullscreen : settings.qualityvideosfullscreen;
    }

    if (!qualityLevels.includes(selectedQuality)) {
      selectedQuality = ["large", "medium", "small", "tiny"].includes(selectedQuality) ? "auto" : qualityLevels[0];
    }

    moviePlayer.setPlaybackQuality?.(selectedQuality);
    moviePlayer.setPlaybackQualityRange?.(selectedQuality);

    try {
      const currentTime = Date.now();
      const expirationTime = currentTime + 31104e6;
      _window.localStorage["yt-player-quality"] = JSON.stringify({
        data: JSON.stringify({
          quality: selectedQuality,
          previousQuality: selectedQuality
        }),
        creation: currentTime,
        expiration: expirationTime
      });
    } catch (error) {
      console.error("Error setting quality in localStorage:", error);
    }
  }

  // OK
  function hideYoutubeContextMenu() {
    var a = _document.querySelector(".ytp-popup.ytp-contextmenu");
    a && 0 < a.clientHeight && (a.style.display = "none");
    _document.body.classList.remove("efyt-ytp-contextmenu-hidden");
  }

  // OK
  function onMouseDownHandler(a) {
    miniplayerActive = true;
    2 === a.button && (settings.controlvolumemousebutton || settings.controlspeedmousebutton) && (Aa = true, _document.body.classList.add("efyt-ytp-contextmenu-hidden"));
  }

  // OK
  function onMouseUpWin(a) {
    miniplayerActive = true;
    if (a.button === 2 && (settings.controlvolumemousebutton || settings.controlspeedmousebutton)) {
      Aa = false;
      if (xa || ya) {
        setTimeout(hideYoutubeContextMenu, 500);
      } else {
        _document.body.classList.remove("efyt-ytp-contextmenu-hidden");
      }
    }
  }

  // OK
  function onMouseUpOther(a) {
    miniplayerActive = true;
    if (a.button === 2 && (settings.controlvolumemousebutton || settings.controlspeedmousebutton)) {
      Aa = false;
      if (xa || ya) {
        mb = true;
        setTimeout(hideYoutubeContextMenu, 500);
      } else {
        mb = false;
        _document.body.classList.remove("efyt-ytp-contextmenu-hidden");
      }
      xa = ya = false;
    }
  }

  // OK
  function onCtxWin(event) {
    if ((settings.controlvolumemousebutton && xa) || (settings.controlspeedmousebutton && ya)) {
      event.stopPropagation();
      event.preventDefault();
      xa = ya = false;
    }
  }

  // OK
  function onCtxOther(event) {
    if ((settings.controlvolumemousebutton || settings.controlspeedmousebutton) && mb) {
      event.preventDefault();
      mb = false;
    }
  }

  // OK
  function exitCinemaMode() {
    if (!ytdApp.fullscreen && !ytdApp.fullscreen_) {
      _document.removeEventListener("keydown", onKeyDownEventHandlerRemovalForCinema);
      _document.body.classList.remove("efyt-cinema-mode");
      if (!settings.wideplayer && settings.cinemamodewideplayer && _document.body.classList.contains("efyt-wide-player")) {
        adjustPlaybackScreen("default");
      } else if (_document.body.classList.contains("_efyt-viewport_")) {
        _document.body.classList.remove("_efyt-viewport_");
        if (settings.wideplayerviewport && Ba && _document.body.classList.contains("efyt-wide-player")) {
          _document.body.classList.add("efyt-viewport");
          _window.scrollTo(_window.scrollX, Number.isInteger(ytdApp.mastheadHeight) ? ytdApp.mastheadHeight : 56);
        }
      }
    }
  }

  // OK
  function enterCinemaMode() {
    if (!ytdApp.fullscreen && !ytdApp.fullscreen_) {
      _document.body.classList.remove("efyt-mini-player");
      if (_document.body.classList.contains("efyt-viewport")) {
        _document.body.classList.remove("efyt-viewport");
        _document.body.classList.add("_efyt-viewport_");
      }
      _window.scrollTo(0, 0);
      backdropElement.classList.remove("no-transition");
      backdropElement.addEventListener("transitionend", function onTransitionEnd() {
        backdropElement.removeEventListener("transitionend", onTransitionEnd);
        backdropElement.classList.add("no-transition");
      });
      _document.body.classList.add("efyt-cinema-mode");
      _document.addEventListener("keydown", onKeyDownEventHandlerRemovalForCinema);
      if (settings.cinemamodewideplayer) {
        adjustPlaybackScreen("large");
      }
    }
  }

  // OK
  function toggleAutoplay(state) {
    const autoplayButton = moviePlayer.querySelector(".ytp-autonav-toggle-button");
    if (autoplayButton) {
      const isAutoplayEnabled = autoplayButton.getAttribute("aria-checked") === "true";
      if ((state && isAutoplayEnabled) || (!state && !isAutoplayEnabled)) {
        autoplayButton.click();
      }
    } else {
      setTimeout(() => {
        toggleAutoplay(state);
      }, 2000);
    }
  }

  // OK
  function sortCommentsClick() {
    const commentSectionSelector = 'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-comments-section"][visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"] a.yt-dropdown-menu:last-of-type, ytd-comments#comments:not([hidden]) yt-sort-filter-sub-menu-renderer.ytd-comments-header-renderer a.yt-dropdown-menu:last-of-type';
    const commentSortButton = _document.querySelector(commentSectionSelector);

    if (!commentSortButton || (commentSortButton.hasAttribute("aria-selected") && commentSortButton.getAttribute("aria-selected") !== "false")) {
      if (!commentSortButton) {
        setTimeout(sortCommentsClick, 1000);
      }
    } else {
      SetEventActionListener("remove");
      commentSortButton.click();
    }
  }

  // OK
  function executeSeekOnLink(a) {
    if (_document.body.classList.contains("efyt-mini-player")) {
      const targetElement = a.target;
      const videoData = moviePlayer?.getVideoData();
      if (targetElement.nodeName === "A" && videoData && new RegExp(`${videoData.video_id}.*&t=(?:\\d+)s?`).test(targetElement.href)) {
        a.preventDefault();
        a.stopImmediatePropagation();
        const timeMatch = targetElement.href.match(/&t=(\d+)s?/);
        if (timeMatch) {
          moviePlayer.seekTo(Number(timeMatch[1]));
        }
      }
    }
  }

  // OK
  function onWindowResize() {
    clearTimeout(tmpFun_windowResize);
    tmpFun_windowResize = setTimeout(() => {
      handleWindowResize();
      handleMiniplayer();
    }, 500);
  }

  var settings, themeVersion, broadcastChannel, nb, Ka, La, F = {},
    userAgentString = String(navigator.userAgent),
    ka = _document.hidden,
    controlsBarFlag = true,
    playbackControls = true,
    rb, miniplayerActive, ytUrlClassification, isVideoAvailable, ytdApp, videoPlaybackManager, Ga, ytHotkeyManager, watchMetadataElement, ytdComments, videoObject, moviePlayer, videoPlaybackController, Q, Ob, playbackRateDisplay, ThumbnailOverlay, StyleElement, settingsButtons, tooltipNode, ytpTooltipWrapper, ytTooltipText, efytReload2, controlsBar, userInstance, ytdControlTooltip, backdropElement, PlaybackRateText, ctrl_progress, ctrl_progress_tooltip, ctrl_progress_hideMiniPlayer, filtersContainer, loopControlPanel, loopStartInput, t, y, loopEndInput, endMinutesInput, loopEndSeconds, videoDurationInSeconds, minimumSeekTime, Hb, Qa, isPlayerUnstarted, gainControl, xa, ya, currentPlaybackRate, g_videoAspectRatio = 1.7777777777777777,
    Ba, scr_Width, scr_Height, Mb, Aa, mb, tmpFun_windowResize, tmpFun_playbackRateTimeout, jb, tmpFun_MouseEnterLeave;

  // OK
  var securityPolicy = _window.trustedTypes.createPolicy("efyt-trusted-types-policy", {
    createHTML: function (a) {
      // console.log(`⛔createHTML: '${a}'`);
      return a;
    },
    createScript: function (a) {
      // console.log(`⛔createScript: '${a}'`);
      return a;
    },
    createScriptURL: function (a) {
      // console.log(`⛔createScriptURL: '${a}'`);
      return a;
    },
  });

  // OK
  try {
    if (!_document.cookie.includes("efyt_allow_experiments")) {
      _document.documentElement.addEventListener("load", function handleLoad() {
        const ytConfig = _window.yt?.config_?.EXPERIMENT_FLAGS;
        if (ytConfig) {
          const flagsToRemove = [
            "desktop_search_prominent_thumbs",
            "enable_desktop_search_bigger_thumbs",
            "enable_desktop_search_bigger_thumbs_square",
            "enable_player_resize_transition",
            "kevlar_watch_comments_panel_button",
            "kevlar_watch_grid",
            "small_avatars_for_comments",
            "small_avatars_for_comments_ep",
            "web_watch_show_comment_teaser",
            "web_watch_compact_comments",
            "web_watch_compact_comments_header"
          ];
          flagsToRemove.forEach(flag => delete ytConfig[flag]);
          if (ytConfig.kevlar_watch_max_player_width > 1280) {
            ytConfig.kevlar_watch_max_player_width = 1280;
            ytConfig.kevlar_watch_page_columns_top_padding = 24;
            ytConfig.kevlar_watch_page_horizontal_margin = 24;
            ytConfig.kevlar_watch_secondary_width = 402;
            ytConfig.wn_grid_max_item_width = 0;
            ytConfig.wn_grid_min_item_width = 0;
            ytConfig.live_reactions_desktop_fab_relocation_mode = 0;
            ytConfig.comment_input_box_triggering_strategy = "NEVER";
          }
          ytConfig.conditional_lab_ids = [];
          _document.documentElement.removeEventListener("load", handleLoad, true);
        }
      }, true);
    }
  } catch (error) {
    console.error("Error handling YouTube experiments:", error);
  }

  // OK
  _document.addEventListener("DOMContentLoaded", () => {
    if (settings) {
      applyDarkThemeIfEnabled();
      applyStylesForCinemaMode();
      applyBackdropColorAndOpacity();
      $executeScriptIfEnabled();
    } else {
      nb = [applyDarkThemeIfEnabled, applyStylesForCinemaMode, applyBackdropColorAndOpacity, $executeScriptIfEnabled];
    }
    registerYtActionsHandlers();
    initializePlaybackUI();
    if (ka) {
      _document.addEventListener("visibilitychange", () => {
        if (settings && settings.blockautoplay && settings.stopvideos && moviePlayer && ("watch" === determineYoutubePath() || "channel" === determineYoutubePath()) && !_document.hidden && !miniplayerActive && (!(0 < _document.location.href.indexOf("list=")) || 0 < _document.location.href.indexOf("list=") && !settings.ignoreplaylists)) {
          ka = undefined;
          onclickStopVideoPlayback();
        }
      }, {
        once: true,
        capture: true
      });
    }
    if (!_window.Polymer && settings?.theme !== "default-dark") {
      cleanupDarkThemeReferences();
    }
  }, {
    once: true
  });

  // OK
  _document.addEventListener("efyt-init", a => {
    settings = a.detail.prefs;
    themeVersion = a.detail.version;
    Ka = a.detail.themes;
    La = a.detail.vendorthemes;
    a.detail.reload && new BroadcastChannel("efyt-" + a.detail.previousversion).postMessage({
      message: "reload"
    });
    currentPlaybackRate = settings.speed;
    settings.controlsvisible && _document.documentElement.classList.add("efyt-controls-visible");
    settings.controlbar.active && _document.documentElement.classList.add("efyt-control-bar-visible");
    settings.hidechat && _document.documentElement.classList.add("efyt-hide-chat");
    settings.hidecomments && _document.documentElement.classList.add("efyt-hide-comments");
    settings.hiderelated && _document.documentElement.classList.add("efyt-hide-related");
    settings.convertshorts && _document.documentElement.classList.add("efyt-convert-shorts");
    settings.hideshorts && _document.documentElement.classList.add("efyt-hide-shorts");
    setThemeStylesheet();
    applyDarkThemeStyles();
    applyCustomTheme();
    nb && (nb.forEach(b => {
      b();
    }), nb = undefined);
    broadcastChannel = new BroadcastChannel("efyt-" + themeVersion);
    broadcastChannel.addEventListener("message", b => {
      "pause-video" === b.data.message && moviePlayer ? moviePlayer.pauseVideo() : "reload" === b.data.message && _document.body.classList.add("efyt-reload-message");
    });
    setInterval(() => {
      _window._lact = Date.now();
    }, 1e4);
  }, {
    once: true
  });

  // OK
  _document.addEventListener("efyt-set-messages", a => {
    F = a.detail.messages;
    _document.querySelectorAll(".ytp-efyt-button, .efyt-control-bar button").forEach(b => {
      b.dataset.tooltip = "efyt-keyboard-shortcuts" === b.id ? F[b.dataset.message] + (userAgentString.includes("Windows") ? " 🗗" : "") : F[b.dataset.message];
    });
    loopControlPanel && loopControlPanel.querySelectorAll("[data-message]").forEach(b => {
      b.textContent = F[b.dataset.message];
    });
    filtersContainer && filtersContainer.querySelectorAll("[data-message]").forEach(b => {
      b.textContent = F[b.dataset.message];
    });
    efytReload2 || displayUpdateNotification();
    efytReload2.dir = F.locale_dir;
    efytReload2.textContent = F.page_reload_required;
  });

  // OK
  _document.addEventListener("efyt-command", btnCmdSelector => {
    var commandDetail = btnCmdSelector.detail.command;
    btnCmdSelector = "button#efyt-" + btnCmdSelector.detail.control;
    switch (commandDetail) {
      case "c400-comments-visibility":
        _document.documentElement.classList.toggle("efyt-hide-comments");
        break;
      case "c410-related-videos-visibility":
        _document.documentElement.classList.toggle("efyt-hide-related");
    }
    if (isVideoAvailable) try {
      switch (commandDetail) {
        case "c060-focus-video-player":
          focusMoviePlayer();
          break;
        case "c070-toggle-loop":
        case "c080-stop-video":
        case "c090-reverse-playlist":
        case "c100-toggle-volume-booster":
        case "c130-toggle-annotations":
        case "c140-toggle-cinema-mode":
        case "c150-toggle-player-size":
          moviePlayer.querySelector(btnCmdSelector).click();
          break;
        case "c160-center-video-player":
          moviePlayer.querySelector(btnCmdSelector).dispatchEvent(new Event("contextmenu"));
          break;
        case "c170-pop-up-player":
        case "c180-decrease-speed":
        case "c190-increase-speed":
        case "c200-default-speed":
          moviePlayer.querySelector(btnCmdSelector).click();
          break;
        case "c210-normal-speed":
          moviePlayer.querySelector(btnCmdSelector).dispatchEvent(new Event("contextmenu"));
          break;
        case "c220-toggle-video-filters":
        case "c230-flip-horizontally":
        case "c240-flip-vertically":
        case "c250-take-screenshot":
        case "c260-keyboard-shortcuts":
        case "c270-custom-script":
          moviePlayer.querySelector(btnCmdSelector).click();
          break;
        case "c280-picture-in-picture":
          (async () => {
            if (videoObject.hasAttribute("efyt-pip")) {
              await _document.exitPictureInPicture();
              videoObject.removeAttribute("efyt-pip");
            } else {
              await videoObject.requestPictureInPicture();
              videoObject.setAttribute("efyt-pip", "");
              videoObject.addEventListener("leavepictureinpicture", () => {
                videoObject.removeAttribute("efyt-pip");
              }, { once: true });
            }
          })();
          break;
        case "c290-quality-highres":
        case "c300-quality-hd2880":
        case "c310-quality-hd2160":
        case "c320-quality-hd1440":
        case "c330-quality-hd1080":
        case "c340-quality-hd720":
        case "c350-quality-large":
        case "c360-quality-medium":
        case "c370-quality-small":
        case "c380-quality-tiny":
        case "c390-quality-auto":
          var e = commandDetail.split("-")[2];
          moviePlayer.setPlaybackQualityRange(e, e);
      }
      "c060-focus-video-player" !== commandDetail && focusMoviePlayer();
    } catch (g) { }
  });

  // OK
  _document.addEventListener("efyt-preference-changed", customEvent => {
    var name = customEvent.detail.name,
      newValue = customEvent.detail.value;
    customEvent = customEvent.detail.oldvalue;
    settings[name] = newValue;
    switch (name) {
      case "applyvideofilters":
        isVideoAvailable && videoObject && (videoObject.style.filter = newValue ? settings.filter : "");
        break;
      case "backdropcolor":
        backdropElement.style.backgroundColor = newValue;
        applyBackdropColorAndOpacity();
        break;
      case "backdropopacity":
        backdropElement.style.opacity = newValue / 100;
        applyBackdropColorAndOpacity();
        break;
      case "blackbars":
        moviePlayer && moviePlayer.classList.toggle("efyt-black-bars", newValue);
        break;
      case "boostvolume":
        let g;
        null == (g = _document.querySelector("button#efyt-volume-booster" + (newValue ? ":not(.active)" : ".active"))) || g.click();
        break;
      case "cinemamode":
        isVideoAvailable && (newValue ? enterCinemaMode() : exitCinemaMode());
        break;
      case "cinemamodewideplayer":
        isVideoAvailable && _document.body.classList.contains("efyt-cinema-mode") && (newValue ? adjustPlaybackScreen("large") : adjustPlaybackScreen("default"));
        break;
      case "controlbar":
        _document.documentElement.classList[newValue.active ? "add" : "remove"]("efyt-control-bar-visible");
        newValue.active && "fixed" !== newValue.position || _document.documentElement.classList.remove("efyt-control-bar-position-absolute");
        if (userInstance && (userInstance.classList[newValue.autohide ? "add" : "remove"]("auto-hide"), userInstance.classList[newValue.centered ? "add" : "remove"]("centered"), newValue.active && isVideoAvailable && moviePlayer && videoPlaybackController))
          if ("fixed" === newValue.position) {
            if (_document.fullscreenElement) {
              let m;
              null == (m = moviePlayer.querySelector(".ytp-chrome-controls")) || m.appendChild(userInstance);
              ytdControlTooltip.classList.add("ytp-tooltip");
            } else moviePlayer.appendChild(userInstance), ytdControlTooltip.classList.remove("ytp-tooltip");
            _document.documentElement.classList.remove("efyt-control-bar-position-absolute");
          } else _document.documentElement.classList.add("efyt-control-bar-position-absolute"), videoPlaybackController.appendChild(userInstance), userInstance.classList.remove("auto-hide");
        let l;
        isVideoAvailable && (null == (l = moviePlayer) ? 0 : l.getVideoAspectRatio) ? (g_videoAspectRatio = moviePlayer.getVideoAspectRatio(), scr_Width = scr_Height = undefined, handleWindowResize()) : !isVideoAvailable && _document.body.classList.contains("efyt-wide-player") && (g_videoAspectRatio = 0);
        break;
      case "controls":
        _document.querySelectorAll(".ytp-efyt-button, .efyt-control-bar button").forEach(m => {
          var q = m.id.split("efyt-")[1];
          "reverse-playlist" === q ? toggleReversePlaylistControl() : m.hidden = settings.controls.includes(q) ? false : true;
        });
        updateControlStyles();
        if (newValue = _document.querySelector("#efyt-controls-button")) 1 < _document.querySelectorAll("#ytp-efyt-controls .ytp-efyt-button:not(#efyt-controls-button):not([hidden])").length ? newValue.removeAttribute("hidden") : newValue.hidden = true;
        break;
      case "controlsvisible":
        _document.documentElement.classList.toggle("efyt-controls-visible", newValue);
        break;
      case "controlvolume":
      case "controlvolumemousebutton":
        let h;
        if (null == (h = moviePlayer) ? 0 : h.getVideoAspectRatio) g_videoAspectRatio = moviePlayer.getVideoAspectRatio(), scr_Width = scr_Height = undefined, handleWindowResize();
        break;
      case "convertshorts":
        _document.documentElement.classList.toggle("efyt-convert-shorts", newValue);
        break;
      case "customcolors":
        applyDarkThemeColors();
        break;
      case "customcss":
        $setCustomTheme(newValue);
        break;
      case "customtheme":
        name = _document.head.querySelector("#efyt-custom-theme");
        newValue && !name ? applyCustomTheme() : !newValue && name && _document.head.removeChild(name);
        break;
      case "darktheme":
      case "theme":
        "darktheme" === name && (newValue ? enableDarkTheme() : disableDarkTheme());
        if ("darktheme" === name && !newValue || "default-dark" === settings.theme) {
          cleanupDarkThemeReferences();
        } else {
          removeDarkThemeColors();
          setThemeStylesheet();
          let darkThemeLink = _document.head.querySelector("#efyt-dark-theme");
          if (darkThemeLink) {
            darkThemeLink.href = ("enhanced-dark" === settings.theme ? Ka + "main.css?v=" : La + "youtube-deep-dark.material.css?v=") + themeVersion;
          } else {
            applyDarkThemeStyles();
          }
          if (settings.customtheme) {
            let customThemeLink = _document.head.querySelector("#efyt-custom-theme");
            if (customThemeLink) {
              _document.head.appendChild(customThemeLink);
            }
          }
        }
        break;
      case "defaultvolume":
        if (newValue) {
          let m;
          null == (m = moviePlayer) || m.setVolume(settings.volume);
        }
        break;
      case "disableautoplay":
        isVideoAvailable && moviePlayer && toggleAutoplay(newValue);
        break;
      case "executescript":
        settings.executescript && onClickCustomScript();
        break;
      case "filter":
        filtersContainer && !filtersContainer.hidden && isVideoAvailable && videoObject && (videoObject.style.filter = newValue);
        break;
      case "hidecardsendscreens":
        isVideoAvailable && (newValue ? disableAnnotationsModule() : enableAnnotationsModule());
        break;
      case "hidechat":
        _document.documentElement.classList.toggle("efyt-hide-chat", newValue);
        if (newValue && videoPlaybackManager && videoPlaybackManager.theater && videoPlaybackManager.hasAttribute("fixed-panels") && videoPlaybackManager.hasAttribute("watch-while-panels-active")) {
          let chatFrame = videoPlaybackManager.querySelector("ytd-live-chat-frame#chat");
          chatFrame?.onShowHideChat?.call(chatFrame);
        }
        break;
      case "hidecomments":
        _document.documentElement.classList.toggle("efyt-hide-comments", newValue);
        break;
      case "hiderelated":
        _document.documentElement.classList.toggle("efyt-hide-related", newValue);
        break;
      case "hideshorts":
        _document.documentElement.classList.toggle("efyt-hide-shorts", newValue);
        break;
      case "localecode":
        _document.dispatchEvent(new Event("efyt-get-messages"));
        break;
      case "miniplayer":
        if (newValue) {
          _document.body.classList.add("efyt-mini-player-" + settings.miniplayersize, "efyt-mini-player-" + settings.miniplayerposition);
          if (isVideoAvailable) initializeObserver();
        } else {
          try {
            _document.body.classList.remove("efyt-mini-player", "efyt-mini-player-" + settings.miniplayersize, "efyt-mini-player-" + settings.miniplayerposition);
            videoPlaybackController.efytObserver.disconnect();
            videoPlaybackController.efytObserver = undefined;
          } catch (m) { }
        }
        break;
      case "miniplayerposition":
      case "miniplayersize":
        _document.body.classList.add("efyt-mini-player-" + newValue);
        _document.body.classList.remove("efyt-mini-player-" + customEvent);
        handleMiniplayer();
        break;
      case "newestcomments":
        isVideoAvailable && ytdComments && (SetEventActionListener("add"), sortCommentsClick());
        break;
      case "qualityplaylists":
      case "qualityplaylistsfullscreen":
      case "qualityvideos":
      case "qualityvideosfullscreen":
      case "selectquality":
        isVideoAvailable && settings.selectquality && moviePlayer && setVideoPlaybackQuality();
        break;
      case "selectqualityfullscreenon":
        isVideoAvailable && settings.selectquality && moviePlayer && newValue && _document.fullscreenElement && setVideoPlaybackQuality();
        break;
      case "speed":
        currentPlaybackRate = newValue;
        if (settings.overridespeeds && videoObject) videoObject.playbackRate = newValue, videoObject.defaultPlaybackRate = newValue;
        else {
          let m, q;
          null == (m = moviePlayer) || null == (q = m.setPlaybackRate) || q.call(m, newValue);
        }
        moviePlayer && (moviePlayer.efytPlaybackRate = newValue);
        break;
      case "theatermode":
        if (isVideoAvailable && videoPlaybackManager && !videoPlaybackManager.playerUnavailable)
          if (newValue) {
            let m, q;
            null == (m = moviePlayer) || null == (q = m.querySelector('.ytp-right-controls path[d="m 28,11 0,14 -20,0 0,-14 z m -18,2 16,0 0,10 -16,0 0,-10 z"]')) || q.parentNode.parentNode.click();
          } else {
            let m, q;
            null == (m = moviePlayer) || null == (q = m.querySelector('.ytp-right-controls path[d="m 26,13 0,10 -16,0 0,-10 z m -14,2 12,0 0,6 -12,0 0,-6 z"]')) || q.parentNode.parentNode.click();
          }
        break;
      case "themevariant":
      case "vendorthemevariant":
        name = _document.head.querySelector("#efyt-dark-theme-colors");
        if (null == name ? 0 : name.hasAttribute("href")) name.href = ("enhanced-dark" === settings.theme ? Ka : La) + newValue;
        break;
      case "volume":
        let k;
        null == (k = moviePlayer) || k.setVolume(newValue);
        break;
      case "volumemultiplier":
        _document.querySelector("#efyt-volume-booster.active") && (gainControl.gain.value = newValue);
        break;
      case "wideplayer":
        isVideoAvailable && (newValue ? adjustPlaybackScreen("large") : _document.body.classList.contains("efyt-wide-player") && adjustPlaybackScreen("default"));
        break;
      case "wideplayerviewport":
        if (newValue) {
          if (Ba) {
            if (_document.body.classList.contains("efyt-wide-player")) {
              if (_document.body.classList.contains("efyt-cinema-mode")) {
                _document.body.classList.add("_efyt-viewport_");
              } else {
                _document.body.classList.add("efyt-viewport");
                setTimeout(() => {
                  _window.scrollTo(_window.scrollX, Number.isInteger(ytdApp.mastheadHeight) ? ytdApp.mastheadHeight : 56);
                }, 200);
              }
            }
          }
        } else {
          _document.body.classList.remove("efyt-viewport", "_efyt-viewport_");
          if (_document.body.classList.contains("efyt-wide-player")) {
            _window.scrollTo(_window.scrollX, 0);
          }
        }
    }
  });

  // OK
  _document.addEventListener("efyt-debug", () => {
    const debugInfo = {
      extension: {
        version: themeVersion,
        settings: settings
      },
      page: _document.location.href,
      browser: userAgentString,
      logged_in: _window.yt?.config_?.LOGGED_IN || "",
      width: _window.yt?.config_?.initialInnerWidth || "",
      height: _window.yt?.config_?.initialInnerHeight || "",
      css: _document.querySelector('link[href*="ytmainappweb"]')?.href || "",
      js: _document.querySelector("#base-js")?.src || "",
      player_css: _window.yt?.config_?.PLAYER_CSS_URL || "",
      player_js: _window.yt?.config_?.PLAYER_JS_URL || "",
      experiment_flags: _window.yt?.config_?.EXPERIMENT_FLAGS || {},
      web_player_context_configs: _window.yt?.config_?.WEB_PLAYER_CONTEXT_CONFIGS || {}
    };

    const blob = new Blob([JSON.stringify(debugInfo, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = _document.createElement("a");
    a.href = url;
    a.download = "debug_info.txt";
    a.click();
    URL.revokeObjectURL(url);
  });

  // OK
  _document.addEventListener("yt-navigate-start", event => {
    if (settings.convertshorts && event.detail.pageType === "shorts" && /^\/shorts\/[^\/]+/.test(event.detail.url)) {
      _document.location.replace("https://www.youtube.com/watch?v=" + event.detail.url.match(/\/shorts\/([^\/]+)/)[1]);
    }

    _document.removeEventListener("mousedown", onMouseDownEventHandlerRemove, true);
    _document.removeEventListener("keydown", onKeyDownEventHandlerRemove, true);
    _document.body.classList.remove("efyt-short");

    ka = undefined;

    if (settings.miniplayer) {
      ctrl_progress.max = 1;
      ctrl_progress.value = 0;
    }

    miniplayerActive = ytdApp.miniplayerIsActive;

    if (loopControlPanel && !loopControlPanel.hidden) {
      hideLoopControl();
    }

    if (moviePlayer) {
      moviePlayer.enhance = true;
      if (!/&list=/.test(event.detail.url)) {
        moviePlayer.efytVolume = undefined;
      }
    }

    if (settings.newestcomments && ytdComments) {
      SetEventActionListener("add");
    }
  }, true);

  // OK - weird
  _document.addEventListener("yt-page-data-fetched", a => {
    if (settings?.miniplayer) {
      _document.body.classList.remove("efyt-mini-player");
    }
  }, true);


  // OK
  _document.addEventListener("yt-navigate-finish", event => {
    isVideoAvailable = "watch" === event.detail.pageType;
    if (!videoObject) initializeVideoClickHandler();
    if (!moviePlayer) initializeMoviePlayer();
    if (!videoPlaybackController) initializePlayerEvents();
    if (!videoPlaybackManager) initializeVideoPlaybackManager();
    if (!Ga) initializePlaylistManager();
    if (!ytHotkeyManager) bindTheaterModeToggle();
    if (!watchMetadataElement) initializeWatchMetadata();
    if (!ytdComments) initializeCommentListener();
    if (controlsBar) updateControlsBar();
    if (playbackControls) updatePlaybackControls();

    if (isVideoAvailable || "watch" === determineYoutubePath()) {
      if (event.detail.fromHistory) {
        if (settings.miniplayer) _document.body.classList.remove("efyt-mini-player");
        if (settings.newestcomments && ytdComments) SetEventActionListener("add");
      }
      _document.body.classList.remove("efyt-masthead-position-fixed");
      if (_document.body.classList.contains("_eyft-cinema-mode_")) {
        _document.body.classList.add("efyt-cinema-mode");
        _document.body.classList.remove("_eyft-cinema-mode_");
      }
      if (userInstance) userInstance.removeAttribute("hidden");
      if (_document.body.classList.contains("efyt-wide-player")) {
        setTimeout(() => {
          _window.dispatchEvent(new Event("resize"));
          if (_document.body.classList.contains("efyt-viewport")) {
            const mastheadHeight = Number.isInteger(ytdApp?.mastheadHeight) ? ytdApp.mastheadHeight : 56;
            _window.scrollTo(_window.scrollX, mastheadHeight);
          }
        }, 1000);
      }
    } else {
      if (_document.body.classList.contains("efyt-wide-player")) {
        _document.body.classList.add("efyt-masthead-position-fixed");
      }
      if ("channel" === event.detail.pageType) {
        _window.dispatchEvent(new Event("resize"));
      }
    }
  });

  // OK
  _document.addEventListener("yt-page-data-updated", event => {
    _document.addEventListener("mousedown", onMouseDownEventHandlerRemove, true);
    _document.addEventListener("keydown", onKeyDownEventHandlerRemove, true);
    ytUrlClassification = event.detail.pageType;

    if (ytUrlClassification === "watch") {
      controlsBarFlag && updateControlsBar();
      playbackControls && updatePlaybackControls();

      if (videoPlaybackManager && !videoPlaybackManager.playerUnavailable) {
        if (settings.theatermode && !videoPlaybackManager.theater) {
          try {
            ytHotkeyManager || bindTheaterModeToggle();
            ytHotkeyManager.toggleTheaterMode();
          } catch (error) {
            videoPlaybackManager.onTheaterReduxValueUpdate?.(true);
          }
        }

        if (settings.cinemamode) {
          enterCinemaMode();
          if (!settings.cinemamodewideplayer && settings.wideplayer) {
            adjustPlaybackScreen("large");
          }
        } else if (settings.wideplayer) {
          adjustPlaybackScreen("large");
        }
      }

      toggleReversePlaylistControl();
    } else {
      if (_document.body.classList.contains("efyt-cinema-mode")) {
        _document.body.classList.add("_eyft-cinema-mode_");
        _document.body.classList.remove("efyt-cinema-mode");
      }

      if (userInstance) {
        userInstance.hidden = true;
      }

      if (loopControlPanel && !loopControlPanel.hidden) {
        hideLoopControl();
      }
    }
  });

  // OK
  _document.addEventListener("yt-player-updated", () => {
    isVideoAvailable = determineYoutubePath() === "watch";
    if (!videoObject) initializeVideoClickHandler();
    if (!moviePlayer) initializeMoviePlayer();
    if (!videoPlaybackController) initializePlayerEvents();
    if (isVideoAvailable && moviePlayer) {
      if (moviePlayer.efytAddListeners) {
        moviePlayer.efytAddListeners = undefined;
        initializePlayerEventListeners();
      }
      const playerState = moviePlayer.getPlayerState();
      if (playerState === 1) updatePlaybackSettings();
      else if (playerState === -1) updatePlaybackSettings(playerState);
    } else if (!isVideoAvailable && moviePlayer) {
      moviePlayer.enhance = true;
    }
    if (moviePlayer?.getVideoAspectRatio && g_videoAspectRatio !== moviePlayer.getVideoAspectRatio()) {
      g_videoAspectRatio = moviePlayer.getVideoAspectRatio();
      handleMiniplayer();
      if (g_videoAspectRatio === 0.5625) _document.body.classList.add("efyt-short");
    }
    if (determineYoutubePath() === "channel") {
      if (!Q) {
        Q = _document.querySelector("#c4-player");
        if (Q) {
          playbackRateDisplay = _document.createElement("efyt-bezel");
          Q.appendChild(playbackRateDisplay);
        }
      }
      if (!Ob) {
        Ob = _document.querySelector("ytd-channel-video-player-renderer #player-container");
        if (Ob) Ob.addEventListener("wheel", kd);
      }
    }
  }, true);

  // OK
  _window.addEventListener("resize", onWindowResize);

  // OK
  const originalPlay = HTMLVideoElement.prototype.play;
  HTMLVideoElement.prototype.play = function () {
    videoObject || initializeVideoClickHandler();
    moviePlayer || initializeMoviePlayer();
    videoPlaybackController || initializePlayerEvents();

    const isWatchOrChannel = ["watch", "channel"].includes(determineYoutubePath());
    const isPlaylist = _document.location.href.includes("list=");
    const shouldStopVideo = settings && settings.blockautoplay && settings.stopvideos && moviePlayer && isWatchOrChannel && !_document.hidden && !miniplayerActive && (!isPlaylist || (isPlaylist && !settings.ignoreplaylists));
    const shouldPauseVideo = settings && settings.blockautoplay && !miniplayerActive && isWatchOrChannel && ((_document.hidden && (!isPlaylist || (isPlaylist && !settings.ignoreplaylists))) || (!_document.hidden && (ka || (settings.pauseforegroundtab && (!isPlaylist || (isPlaylist && !settings.ignoreplaylists))))));

    if (shouldStopVideo) {
      ka && (ka = undefined);
      onclickStopVideoPlayback();
    } else if (shouldPauseVideo) {
      this.pause?.();
      !_document.hidden && ka && (ka = undefined);
      return Promise.reject(new DOMException("NotAllowedError"));
    }

    return originalPlay.apply(this, arguments);
  };

  // OK
  if (_window.MediaSource) {
    const originalIsTypeSupported = _window.MediaSource.isTypeSupported;
    _window.MediaSource.isTypeSupported = function (type) {
      if (settings) {
        const blockHFR = settings.blockhfrformats && /framerate=([4-6]\d|\d{3,})/.test(type);
        const blockWebM = settings.blockwebmformats && /video\/webm/.test(type);
        if (blockHFR || blockWebM) {
          return false;
        }
      }
      return originalIsTypeSupported(type);
    };
  }

  // OK
  class efytBackdrop extends HTMLElement {
    constructor() { super(); }
  }
  _window.customElements.define("efyt-backdrop", efytBackdrop);

  // OK
  class efytBezel extends HTMLElement {
    constructor() { super(); }
  }
  _window.customElements.define("efyt-bezel", efytBezel);

  // OK
  class efytProgressTooltip extends HTMLElement {
    constructor() { super(); }
  }
  _window.customElements.define("efyt-progress-tooltip", efytProgressTooltip);

  // OK
  class efytHideMiniPlayer extends HTMLElement {
    constructor() { super(); }
  }
  _window.customElements.define("efyt-hide-mini-player", efytHideMiniPlayer);

  // OK
  class efytReload extends HTMLElement {
    constructor() { super(); }

    connectedCallback() {
      this.addEventListener("click", () => {
        _document.body.classList.remove("efyt-reload-message");
      });
    }
  }
  _window.customElements.define("efyt-reload", efytReload);
})(window, document);