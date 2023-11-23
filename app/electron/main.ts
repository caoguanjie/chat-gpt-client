import { app, BrowserWindow, Menu, ipcMain, screen, dialog, session } from 'electron';
import { join } from 'path';
import { platform, env } from 'process'
import { autoUpdate } from './autoUpdate'
// import url from 'node:url'
// 全局变量，为了控制主线程的状态和共享数据
global.shareObject = {
    // isLogin: false
};



let mainWindow, loginWindow, isLogin = false;
/**
 * 创建登录窗口
 */
const createLoginWindow = () => {
    if (loginWindow) {
        return
    }
    const defaultConfig = {
        show: false,// 显示窗口将没有视觉闪烁（配合下面的ready-to-show事件）
        hasShadow: true,//窗口是否有阴影
        useContentSize: false,
        resizable: true,//用户不可以调整窗口
        center: true, // 窗口居中
        maximizable: false, // 登录界面不可以最大化
        backgroundColor: "#fff",
        // alwaysOnTop: true,//窗口一直保持在其他窗口前面
        webPreferences: {
            //========关闭安全策略===========
            webSecurity: false,
            // 是否完整支持node.
            nodeIntegration: true,
            preload: join(__dirname, './preload.js')
            // contextIsolation: false
        },
    }
    const windowConfig = {
        // window窗口是32px顶部栏
        height: 545,
        width: 470,
        autoHideMenuBar: true, // 隐藏菜单栏，仅仅window系统有效
    }
    const macConfig = {
        height: 500,
        width: 450,
        frame: false, // 无边框
        transparent: true, // 透明
        titleBarStyle: 'hidden',
    }
    const config: any = platform === 'darwin' ? { ...defaultConfig, ...macConfig } : { ...defaultConfig, ...windowConfig }
    // window窗口是32px顶部栏
    loginWindow = new BrowserWindow(config)
    if (process.env.NODE_ENV === "development") {
        loginWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/login`)
    } else {
        loginWindow.loadFile(join(__dirname, 'FitsAdmin/index.html'), {
            hash: "login"
        });
        // loginWindow.loadURL('http://192.168.32.60:3001/#/login');
    }

    // loginWindow.webContents.openDevTools()
    // 为了防止闪烁，让画面准备好了再显示
    // 对于一个复杂的应用，ready-to-show 可能发出的太晚，会让应用感觉缓慢。 在这种情况下，建议立刻显示窗口，并使用接近应用程序背景的 backgroundColor
    // 请注意，即使是使用 ready-to-show 事件的应用程序，仍建议使用设置 backgroundColor 使应用程序感觉更原生。
    loginWindow.once('ready-to-show', () => {
        loginWindow.show()
    })

    loginWindow.on('closed', () => {
        // 窗口关闭后，loginWindow对象会被自动回收掉
        loginWindow = null
    })



}

const createMainWindow = () => {
    if (mainWindow) {
        return
    }
    mainWindow = new BrowserWindow({
        show: false,
        // 窗口图标
        icon: join(__dirname, './resources/icons/icon.ico'),
        width: 1400,
        height: 900,
        minWidth: 600,
        minHeight: 370,
        resizable: false,//用户不可以调整窗口
        autoHideMenuBar: true,
        useContentSize: true,
        webPreferences: {
            //========关闭安全策略===========
            webSecurity: false,
            nodeIntegration: true,
            preload: join(__dirname, './preload.js')
            // contextIsolation: false
        }

    })

    process.env.NODE_ENV === "development" && mainWindow.webContents.openDevTools()
    if (process.env.NODE_ENV === "development") {
        mainWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}`)
    } else {
        mainWindow.loadFile(join(__dirname, 'dist/index.html'));
    }
    mainWindow.on('closed', () => {
        mainWindow = null
    })

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })


}

/**
 * 所谓应用程序单一实例，就是只能有一个实例在运行。
 * 当你没有使用单一实例的时候，可以同一时间开启多个程序，不受限制，但是很多时候我们需要在同一时间只有一个程序实例运行
 */

const gotTheLock = app.requestSingleInstanceLock()
console.log('当前有个多少个实例', gotTheLock)
if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        console.log('第二个实例')
        const win = mainWindow
        win && win.focus
    })

}

// ready比whenReady先执行
app.whenReady().then(() => {
    console.log('我执行了没')
    // createLoginWindow()
    createMainWindow();
    // 隐藏菜单栏,只适合mac
    createMenu()

})

app.on('activate', () => {
    // 解决在macos上，dock图标点击后，没有任何窗口弹出
    if (BrowserWindow.getAllWindows().length === 0) {

        createMainWindow()
    }
})

app.on('window-all-closed', () => {
    console.log('window-all-closed')
    if (process.platform !== 'darwin') app.quit()
})

// 登录成功后，通知主线程创建新的主界面，并且清理登录窗口痕迹
// ipcMain.on('openMainWindow', () => {
//     isLogin = true;
//     createMainWindow()
//     console.log('openMainWindow')
//     loginWindow.destroy()
//     loginWindow = null


// })
// // 退出登录
// ipcMain.on('openLoginWindow', () => {
//     isLogin = false;
//     createLoginWindow()
//     mainWindow.destroy()
//     mainWindow = null

// })


// // 第一次加载窗口之后，需要调整伸缩比例
// ipcMain.on('firstWidowResize', (e, { width }) => {

//     changeWindowZoom({ width }, e.sender)
// })
// // 改变窗口的伸缩比例
// function changeWindowZoom({ width }, sender: any) {
//     if (!isLogin) return
//     const designWidth = 1920;
//     const deviceScaleFactor = screen.getPrimaryDisplay().scaleFactor;  // 桌面端的缩放比例scaleFactor
//     /** 响应式比例控制在0.9-1.2之间波动 */
//     const zoom = Math.min(Math.max(Number(width / designWidth * deviceScaleFactor), 0.9), 1.2).toFixed(3);
//     sender.send('setZoomFactor', zoom)
// }

function createMenu() {
    // darwin表示macOS，针对macOS的设置  process.platform === 'darwin'
    if (process.platform === 'darwin') {
        const template: any = [{
            label: '我的应用',
            submenu: [
                { label: '关于', accelerator: 'CmdOrCtrl+I', role: 'about' },
                { type: 'separator' },
                { label: '隐藏', role: 'hide' },
                { label: '隐藏其他', role: 'hideOthers' },
                { type: 'separator' },
                { label: '服务', role: 'services' },
                { label: '退出', accelerator: 'Command+Q', role: 'quit' }
            ]
        },
        {
            label: '编辑',
            submenu: [
                { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
            ]
        }]
        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
    } else {
        // windows及linux系统
        Menu.setApplicationMenu(null)
    }
}