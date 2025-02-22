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
((E, e) => {

    // OK
    function L(a) {
        if (a === 1) {
            d.removeEventListener("onStateChange", L);
            S();
            M.forEach(c => c());
            if (b.defaultvolume) d.setVolume(b.volume);
            if (b.overridespeeds) {
                l.playbackRate = b.speed;
                l.defaultPlaybackRate = b.speed;
            } else {
                d.setPlaybackRate(b.speed);
            }
        }
    }

    // OK
    function T(a) {
        if (a === 1) {
            if (b.pausevideos) {
                F.postMessage({ message: "pause-video" });
            }
            m.classList.add("ytp-pause-overlay-hidden");
        } else if (a === 2) {
            setTimeout(() => {
                d.classList.remove("ytp-expand-pause-overlay");
                m.classList.remove("ytp-pause-overlay-hidden");
            }, 1000);
        } else if (a === 0) {
            G = false;
        }

        if ((a === 1 || a === 3) && b.selectquality && !G) {
            z();
        }
    }

    // OK
    function U(a) {
        if (a.ctrlKey) {
            a.preventDefault();
            const speed = a.shiftKey ? 1 : b.speed;
            if (b.overridespeeds) {
                l.playbackRate = speed;
            } else {
                d?.setPlaybackRate(speed);
            }
            r.textContent = speed + "x";
            H();
        }
    }
    // OK
    function V() {
        x = u = v = false;
        e.body.classList.remove("ytp-contextmenu-hidden");
    }

    // OK
    function W(a) {
        if (a.button === 2 && (b.controlvolumemousebutton || b.controlspeedmousebutton)) {
            x = true;
            e.body.classList.add("ytp-contextmenu-hidden");
        }
    }

    // OK
    function X(a) {
        if (a.button === 2 && (b.controlvolumemousebutton || b.controlspeedmousebutton)) {
            x = false;
            if (N) {
                if (u || v) {
                    setTimeout(O, 500);
                } else {
                    e.body.classList.remove("ytp-contextmenu-hidden");
                }
            } else {
                if (u || v) {
                    A = true;
                    setTimeout(O, 500);
                } else {
                    A = false;
                    e.body.classList.remove("ytp-contextmenu-hidden");
                }
                u = v = false;
            }
        }
    }

    // OK
    function Y(a) {
        if (N && (b.controlvolumemousebutton && u || b.controlspeedmousebutton && v)) {
            a.stopPropagation();
            a.preventDefault();
            u = v = false;
        } else if ((b.controlvolumemousebutton || b.controlspeedmousebutton) && A) {
            a.preventDefault();
            A = false;
        }
    }

    // OK
    function Z(a) {
        if (!d.classList.contains("ytp-settings-shown") && !d.classList.contains("ytp-menu-shown")) {
            if (a.ctrlKey && b.controlspeed && (b.controlspeedmousebutton && x || !b.controlspeedmousebutton)) {
                handleSpeedControl(a);
            } else if (b.controlvolume && (b.controlvolumemousebutton && x || !b.controlvolumemousebutton)) {
                handleVolumeControl(a);
            }
        }
    }

    // OK
    function handleSpeedControl(a) {
        a.preventDefault();
        try {
            let c;
            if (b.overridespeeds) {
                c = l.playbackRate;
                if ((!b.reversemousewheeldirection && a.deltaY > 0) || (b.reversemousewheeldirection && a.deltaY < 0)) {
                    c = parseFloat((c - b.speedvariation).toFixed(2));
                    if (c <= 0) c = b.speedvariation;
                } else {
                    c = parseFloat((c + b.speedvariation).toFixed(2));
                }
                l.playbackRate = c;
            } else {
                const g = d.getAvailablePlaybackRates();
                c = d.getPlaybackRate();
                const f = g.indexOf(c);
                if ((!b.reversemousewheeldirection && a.deltaY > 0) || (b.reversemousewheeldirection && a.deltaY < 0)) {
                    if (f > 0) c = g[f - 1];
                } else {
                    if (f < g.length - 1) c = g[f + 1];
                }
                d.setPlaybackRate(c);
            }
            v = true;
            r.textContent = c + "x";
            H();
        } catch (k) { }
    }

    // OK
    function handleVolumeControl(a) {
        a.preventDefault();
        try {
            let h = d.getVolume();
            if ((!b.reversemousewheeldirection && a.deltaY > 0) || (b.reversemousewheeldirection && a.deltaY < 0)) {
                h -= b.volumevariation;
                if (h < 0) h = 0;
            } else {
                h += b.volumevariation;
                if (h > 100) h = 100;
                if (d.isMuted()) d.unMute();
            }
            u = true;
            d.setVolume(h);
            r.textContent = h;
            H();
        } catch (k) { }
    }

    // OK
    function O() {
        var a = e.querySelector(".ytp-popup.ytp-contextmenu");
        a && 0 < a.getBoundingClientRect().height && (a.style.display = "none");
        e.body.classList.remove("ytp-contextmenu-hidden");
    }

    // OK
    function z() {
        var availableQualityLevels = d.getAvailableQualityLevels(),
            c = e.fullscreenElement ? b.qualityembedsfullscreen : b.qualityembeds;
        if (availableQualityLevels.includes(c)) {
            let g, f;
            null == (f = (g = d).setPlaybackQuality) || f.call(g, c);
            let h, k;
            null == (k = (h = d).setPlaybackQualityRange) || k.call(h, c);
        } else {
            c = ["large", "medium", "small", "tiny"].includes(c) ? "auto" : availableQualityLevels[0];
            let g, f;
            null == (f = (g = d).setPlaybackQuality) || f.call(g, c);
            let h, k;
            null == (k = (h = d).setPlaybackQualityRange) || k.call(h, c);
        }
    }

    // OK
    function H() {
        r.setAttribute("style", ua.createScript("display:block!important"));
        clearTimeout(P);
        P = setTimeout(() => {
            r.setAttribute("style", ua.createScript("display:none!important"));
        }, 1500);
    }

    // OK
    function aa() {
        J.dispatchEvent(new Event("mouseover"));
        J.dispatchEvent(new Event("mouseout"));
        if (!y) {
            y = d.querySelector(".ytp-tooltip:not(.ytp-efyt-tooltip)");
        }
        if (y && y.style.top !== "") {
            B.textContent = this.dataset.tooltip;
            n.style.display = "block";
            n.style.top = y.style.top;
            n.style.left = `${this.parentNode.parentNode.parentNode.offsetLeft + this.offsetLeft + this.offsetWidth / 2 - n.getBoundingClientRect().width / 2}px`;
        }
    }

    // OK
    function hideElement() {
        n.style.display = "none";
    }

    // OK
    function createSVGButton(a, c, g) {
        var f = e.createElement("button"),
            h = e.createElementNS("http://www.w3.org/2000/svg", "use"),
            k = e.createElementNS("http://www.w3.org/2000/svg", "svg"),
            q = e.createElementNS("http://www.w3.org/2000/svg", "path");
        f.className = "ytp-button ytp-efyt-button";
        f.style.display = b.controls.includes(a) ? "inline-block" : "none";
        k.setAttributeNS(null, "version", "1.1");
        k.setAttributeNS(null, "viewBox", "0 0 36 36");
        k.setAttributeNS(null, "height", "100%");
        k.setAttributeNS(null, "width", "100%");
        h.setAttribute("class", ua.createScript("ytp-svg-shadow"));
        h.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#ytp-efyt-" + a);
        q.setAttributeNS(null, "id", "ytp-efyt-" + a);
        q.setAttributeNS(null, "d", c);
        q.setAttributeNS(null, "fill", "#fff");
        g && q.setAttributeNS(null, "transform", g);
        k.appendChild(h);
        k.appendChild(q);
        f.appendChild(k);
        f.addEventListener("mouseover", aa);
        f.addEventListener("mouseout", hideElement);
        return f;
    }

    // OK
    function S() {
        J = d.querySelector(".ytp-settings-button");
        B = e.createElement("span");
        B.className = "ytp-tooltip-text";
        const tooltipWrapper = e.createElement("div");
        tooltipWrapper.appendChild(B);
        tooltipWrapper.className = "ytp-tooltip-text-wrapper";
        n = e.createElement("div");
        n.appendChild(tooltipWrapper);
        n.className = "ytp-tooltip ytp-efyt-tooltip";
        n.style.display = "none";
        d.appendChild(n);

        const screenshotButton = createSVGButton("screenshot", "M 26.079999,10.02 H 22.878298 L 21.029999,8 h -6.06 l -1.8483,2.02 H 9.9200015 c -1.111,0 -2.02,0.909 -2.02,2.02 v 12.12 c 0,1.111 0.909,2.02 2.02,2.02 H 26.079999 c 1.111,0 2.019999,-0.909 2.019999,-2.02 V 12.04 c 0,-1.111 -0.909,-2.02 -2.019999,-2.02 z m 0,14.14 H 9.9200015 V 12.04 h 4.0904965 l 1.8483,-2.02 h 4.2824 l 1.8483,2.02 h 4.0905 z m -8.08,-11.11 c -2.7876,0 -5.05,2.2624 -5.05,5.05 0,2.7876 2.2624,5.05 5.05,5.05 2.7876,0 5.049999,-2.2624 5.049999,-5.05 0,-2.7876 -2.262399,-5.05 -5.049999,-5.05 z m 0,8.08 c -1.6665,0 -3.03,-1.3635 -3.03,-3.03 0,-1.6665 1.3635,-3.03 3.03,-3.03 1.6665,0 3.03,1.3635 3.03,3.03 0,1.6665 -1.3635,3.03 -3.03,3.03 z");
        screenshotButton.dataset.tooltip = Q.screenshot;
        screenshotButton.id = "efyt-screenshot";
        screenshotButton.addEventListener("click", () => {
            if (l) {
                const canvas = e.createElement("canvas"),
                    context = canvas.getContext("2d"),
                    width = l.clientWidth,
                    height = l.clientHeight,
                    timestamp = (time => {
                        const hours = Math.floor(time / 3600),
                            minutes = Math.floor(time % 3600 / 60),
                            seconds = Math.floor(time % 3600 % 60);
                        return `${hours > 0 ? hours + "h" : ""}${minutes > 0 ? (hours > 0 && minutes < 10 ? "0" : "") + minutes + "m" : hours > 0 && minutes === 0 ? "00m" : "0m"}${seconds < 10 ? "0" : ""}${seconds}s`;
                    })(parseInt(d.getCurrentTime(), 10));
                canvas.width = width;
                canvas.height = height;
                context.drawImage(l, 0, 0, width, height);
                canvas.toBlob(blob => {
                    const videoData = d.getVideoData(),
                        author = videoData.author.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, " ").trim(),
                        title = videoData.title.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, " ").trim(),
                        videoId = videoData.video_id,
                        downloadLink = e.createElement("a");
                    downloadLink.href = URL.createObjectURL(blob);
                    downloadLink.download = `${author} - ${title} [${videoId} - ${width}x${height} - ${timestamp}].png`;
                    downloadLink.click();
                    URL.revokeObjectURL(downloadLink.href);
                });
            }
        });

        const rightControls = d.querySelector(".ytp-right-controls");
        rightControls && rightControls.insertBefore(screenshotButton, rightControls.firstChild);

        const titleText = d.querySelector(".ytp-title-text");
        titleText && d.addEventListener("onStateChange", () => {
            E.top.document.title = titleText.textContent + " - Enhancer for YouTube™";
        });
    }

    // OK
    function fa() {
        d.loadPlaylist(D.videos, D.index, D.start);
    }

    var b, R, F, D, M = [],
        Q = {},
        N = String(navigator.userAgent).includes("Windows"),
        x = false,
        v = false,
        u = false,
        G, A, P, r, l, d, m, J, y, n, B, ua = E.trustedTypes.createPolicy("efyt-trusted-types-policy", {
            createHTML: a => a,
            createScript: a => a,
            createScriptURL: a => a
        });
    e.addEventListener("DOMContentLoaded", () => {
        var a = e.createElement("style");
        a.textContent = "#efyt-bezel{display:none;background-color:rgba(0,0,0,.5);color:#fff;font-size:175%;border-radius:3px;padding:10px 20px;position:absolute;top:10%;left:50%;transform:translateX(-50%);z-index:19} body.ytp-contextmenu-hidden .ytp-contextmenu{visibility:hidden!important} .ytp-pause-overlay-hidden .ytp-pause-overlay{display:none!important}";
        e.head.appendChild(a);
        r = e.createElement("div");
        r.id = "efyt-bezel";
    }, {
        once: true
    });
    e.addEventListener("click", () => {
        interaction = true;
    }, {
        once: true,
        capture: true
    });
    e.addEventListener("efyt-init", a => {
        b = a.detail.prefs;
        R = a.detail.version;
        Q = a.detail.messages;
        F = new BroadcastChannel("efyt-" + R);
        F.addEventListener("message", c => {
            if ("pause-video" === c.data.message && !b.ignorepopupplayer) {
                let g;
                null == (g = d) || g.pauseVideo();
            }
        });
    }, {
        once: true
    });
    e.addEventListener("efyt-pop-up-player-message", a => {
        "load-playlist" === a.detail.message && (D = a.detail.playlist, M.push(fa));
    });
    e.addEventListener("efyt-preference-changed", a => {
        var c = a.detail.name;
        a = a.detail.value;
        b[c] = a;
        if (d) switch (c) {
            case "controls":
                b.controls = a;
                d.querySelectorAll(".ytp-efyt-button").forEach(function (g) {
                    var f = g.id.split("efyt-")[1];
                    g.style.display = b.controls.includes(f) ? "inline-block" : "none";
                });
                break;
            case "defaultvolume":
                b.defaultvolume && d.setVolume(b.volume);
                break;
            case "overridespeeds":
                b.overridespeeds ? (l.playbackRate = b.speed, l.defaultPlaybackRate = b.speed) : d.setPlaybackRate(b.speed);
                break;
            case "selectquality":
                b.selectquality && (G = false, z());
        }
    });
    var K;
    "onfullscreenchange" in e ? K = "fullscreenchange" : "onmozfullscreenchange" in e && (K = "mozfullscreenchange");
    e.addEventListener(K, a => {
        setTimeout(() => {
            e.fullscreenElement && b.selectquality && b.selectqualityfullscreenon ? z() : !e.fullscreenElement && b.selectquality && b.selectqualityfullscreenoff && z();
        }, 500);
    });
    const originalPlay = HTMLVideoElement.prototype.play;
    HTMLVideoElement.prototype.play = function () {
        if (!l && this.classList.contains("html5-main-video")) {
            l = this;
            l.addEventListener("click", U);
        }
        if (!d) {
            d = e.querySelector("#movie_player");
            if (d) {
                d.appendChild(r);
                d.addEventListener("onStateChange", L);
                d.addEventListener("onStateChange", T);
            }
        }
        if (!m) {
            m = e.querySelector("#player:has(#movie_player)");
            if (m) {
                m.classList.add("ytp-pause-overlay-hidden");
                m.addEventListener("mouseleave", V);
                m.addEventListener("mousedown", W, true);
                m.addEventListener("mouseup", X, true);
                m.addEventListener("contextmenu", Y, true);
                m.addEventListener("wheel", Z);
            }
        }
        if (b) {
            return originalPlay.apply(this, arguments);
        } else {
            setTimeout(() => {
                if (l) l.play();
            }, 500);
            return new Promise((resolve, reject) => reject(new DOMException("NotAllowedError")));
        }
    };

    if (E.MediaSource) {
        const originalIsTypeSupported = MediaSource.isTypeSupported;
        MediaSource.isTypeSupported = function (type) {
            if (b && b.blockhfrformats && /framerate=([4-6]\d|\d{3,})/.test(type)) {
                return false;
            }
            if (b && b.blockwebmformats && /video\/webm/.test(type)) {
                return false;
            }
            return originalIsTypeSupported(type);
        };
    }
})(window, document);