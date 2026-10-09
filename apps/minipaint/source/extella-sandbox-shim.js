/* SPDX-License-Identifier: GPL-3.0-only
 * Modified by Extella on 2026-10-09: distribute this app-local copy under GPL-3.0-only.
 * The original permissive notice below is retained. */
/* Extella window compatibility shim. MIT License, (c) 2026 Chariot Technologies Lab (Extella).
 *
 * The Extella OS window shows an app in a sandboxed frame without `allow-same-origin`. In such a frame the page has an
 * opaque origin, and reading `localStorage`, `sessionStorage` or `indexedDB` throws SecurityError. Many browser apps
 * read storage at startup without a guard and never render.
 *
 * This file is loaded before the app's own scripts. Where storage is unavailable it puts an in-memory replacement in
 * place, so the app starts and works for the lifetime of the window. Nothing is written to disk and nothing is sent
 * anywhere: data kept only in browser storage is lost when the window closes. Save your work to a file.
 * Where storage works (a normal browser tab), the shim does nothing.
 */
(function () {
  'use strict';
  function works(name) { try { var s = window[name]; s.getItem('__extella_probe__'); return true; } catch (e) { return false; } }
  function memoryStorage() {
    var data = new Map();
    var api = {
      getItem: function (k) { k = String(k); return data.has(k) ? data.get(k) : null; },
      setItem: function (k, v) { data.set(String(k), String(v)); },
      removeItem: function (k) { data.delete(String(k)); },
      clear: function () { data.clear(); },
      key: function (i) { var keys = Array.from(data.keys()); return i >= 0 && i < keys.length ? keys[i] : null; }
    };
    // Preserve application helpers added to Storage.prototype without invoking
    // native storage methods: the in-memory methods above remain own properties.
    if (typeof Storage !== 'undefined') {
      try { Object.setPrototypeOf(api, Storage.prototype); } catch (e) {}
    }
    return new Proxy(api, {
      get: function (t, p) { if (p === 'length') return data.size; if (p in t) return t[p]; return typeof p === 'string' && data.has(p) ? data.get(p) : undefined; },
      set: function (t, p, v) { if (typeof p === 'string' && !(p in t)) data.set(p, String(v)); return true; },
      deleteProperty: function (t, p) { if (typeof p === 'string') data.delete(p); return true; },
      has: function (t, p) { return p in t || (typeof p === 'string' && data.has(p)); },
      ownKeys: function () { return Array.from(data.keys()); },
      getOwnPropertyDescriptor: function (t, p) { return typeof p === 'string' && data.has(p) ? { value: data.get(p), writable: true, enumerable: true, configurable: true } : undefined; }
    });
  }
  var replaced = [];
  ['localStorage', 'sessionStorage'].forEach(function (name) {
    if (works(name)) return;
    try { Object.defineProperty(window, name, { value: memoryStorage(), configurable: true, writable: false }); replaced.push(name); } catch (e) {}
  });
  var idbWorks = true;
  try { window.indexedDB.open('__extella_probe__'); } catch (e) { idbWorks = false; }
  if (!idbWorks) {
    // "No database at all" is a state libraries handle (they fall back); a throwing one is not.
    try { Object.defineProperty(window, 'indexedDB', { value: undefined, configurable: true }); replaced.push('indexedDB'); } catch (e) {}
  }
  try { if (document.cookie === undefined) { /* reading may throw below */ } } catch (e) {
    try { var jar = ''; Object.defineProperty(document, 'cookie', { get: function () { return jar; }, set: function (v) { jar = String(v).split(';')[0]; }, configurable: true }); replaced.push('cookie'); } catch (e2) {}
  }
  // Reading navigator.serviceWorker itself throws in a sandboxed frame; "no service workers" is a state apps handle.
  try { void navigator.serviceWorker; } catch (e) {
    try { var fakeRegistration = { update: function () { return Promise.resolve(); }, unregister: function () { return Promise.resolve(true); }, addEventListener: function () {}, removeEventListener: function () {} };
      var fakeContainer = { register: function () { return Promise.resolve(fakeRegistration); }, getRegistration: function () { return Promise.resolve(undefined); },
        getRegistrations: function () { return Promise.resolve([]); }, addEventListener: function () {}, removeEventListener: function () {}, controller: null, ready: new Promise(function () {}) };
      Object.defineProperty(Navigator.prototype, 'serviceWorker', { get: function () { return fakeContainer; }, configurable: true }); replaced.push('serviceWorker'); } catch (e2) {}
  }
  // File pickers of the File System Access API are refused in a sandboxed sub-frame. Without them apps use their
  // ordinary fallback: a download link to save, a file input to open. Both work in the window.
  if (replaced.length) {
    ['showSaveFilePicker', 'showOpenFilePicker', 'showDirectoryPicker'].forEach(function (name) {
      if (name in window) { try { delete window[name]; if (name in window) Object.defineProperty(window, name, { value: undefined, configurable: true }); replaced.push(name); } catch (e) {} }
    });
  }
  window.__extellaSandboxShim = { replaced: replaced, persistent: replaced.length === 0 };
})();
