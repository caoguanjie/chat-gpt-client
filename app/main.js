"use strict";
const electron = require("electron");
const path = require("path");
require("process");
global.shareObject = {
  // isLogin: false
};
let mainWindow;
const createMainWindow = () => {
  if (mainWindow) {
    return;
  }
  mainWindow = new electron.BrowserWindow({
    show: false,
    // 窗口图标
    icon: path.join(__dirname, "./resources/icons/icon.ico"),
    width: 1400,
    height: 900,
    minWidth: 600,
    minHeight: 370,
    resizable: false,
    //用户不可以调整窗口
    autoHideMenuBar: true,
    useContentSize: true,
    webPreferences: {
      //========关闭安全策略===========
      webSecurity: false,
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js")
      // contextIsolation: false
    }
  });
  process.env.NODE_ENV === "development" && mainWindow.webContents.openDevTools();
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}`);
  } else {
    mainWindow.loadFile(path.join(__dirname, "dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
};
const gotTheLock = electron.app.requestSingleInstanceLock();
console.log("当前有个多少个实例", gotTheLock);
if (!gotTheLock) {
  electron.app.quit();
} else {
  electron.app.on("second-instance", (event, commandLine, workingDirectory) => {
    console.log("第二个实例");
    const win = mainWindow;
    win && win.focus;
  });
}
electron.app.whenReady().then(() => {
  console.log("我执行了没");
  createMainWindow();
  createMenu();
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
electron.app.on("window-all-closed", () => {
  console.log("window-all-closed");
  if (process.platform !== "darwin")
    electron.app.quit();
});
function createMenu() {
  if (process.platform === "darwin") {
    const template = [
      {
        label: "我的应用",
        submenu: [
          { label: "关于", accelerator: "CmdOrCtrl+I", role: "about" },
          { type: "separator" },
          { label: "隐藏", role: "hide" },
          { label: "隐藏其他", role: "hideOthers" },
          { type: "separator" },
          { label: "服务", role: "services" },
          { label: "退出", accelerator: "Command+Q", role: "quit" }
        ]
      },
      {
        label: "编辑",
        submenu: [
          { label: "复制", accelerator: "CmdOrCtrl+C", role: "copy" },
          { label: "粘贴", accelerator: "CmdOrCtrl+V", role: "paste" },
          { label: "剪切", accelerator: "CmdOrCtrl+X", role: "cut" },
          { label: "撤销", accelerator: "CmdOrCtrl+Z", role: "undo" },
          { label: "重做", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
          { label: "全选", accelerator: "CmdOrCtrl+A", role: "selectAll" }
        ]
      }
    ];
    const menu = electron.Menu.buildFromTemplate(template);
    electron.Menu.setApplicationMenu(menu);
  } else {
    electron.Menu.setApplicationMenu(null);
  }
}
