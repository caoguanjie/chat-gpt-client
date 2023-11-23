"use strict";
const electron = require("electron");
window.addEventListener("DOMContentLoaded", () => {
  electron.contextBridge.exposeInMainWorld("ipcRenderer", {
    send: (channel, data) => electron.ipcRenderer.send(channel, data),
    on: (channel, callback) => {
      const newCallback = (_, data) => callback(data);
      electron.ipcRenderer.on(channel, newCallback);
    }
  });
});
