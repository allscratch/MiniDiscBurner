// ==UserScript==
// @name         MiniDiscBurner Song Recognition Enabler
// @description  Permet d'utiliser la reconnaissance de morceaux de MiniDiscBurner dans le navigateur, sans l'application desktop
// @version      0.1.0
// @namespace    http://tampermonkey.net/
// @author       Asivery (adapté pour MiniDiscBurner)
// @match        http://localhost:5173/*
// @match        http://127.0.0.1:5173/*
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @run-at       document-start
// @connect      amp.shazam.com
// ==/UserScript==

(function() {
    'use strict';
    unsafeWindow.native = {
        unrestrictedFetchJSON: (url, parameters = {}) => new Promise((res, rej) => {
            GM.xmlHttpRequest({
                method: parameters.method ?? "GET",
                url,
                data: parameters.body ?? "",
                headers: parameters.headers ?? { "Content-Type": "application/json" },
                onload: response =>
                    res(JSON.parse(response.responseText)),
                onerror: error =>
                    rej(error)
            })
        })};
    console.log("[Userscript]: Attached MiniDiscBurner's fetch method successfully!");
})();
