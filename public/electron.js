const { app, BrowserWindow, ipcMain, dialog } = require("electron");

const path = require("path");
const isDev = require("electron-is-dev");
const fs = require("fs");
const os = require("os");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  BrowserWindow.addDevToolsExtension(
    path.join(
      os.homedir(),
      "AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\fmkadmapgofadopljbjfkapdkoienihi\\4.4.0_0"
    )
  );

  console.log("Window ready.");
  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("open-file", (event, arg) => {
  try {
    console.log("Open file event received.");
    let openDialog = dialog.showOpenDialogSync({ properties: ["openFile"] });
    let filePath = openDialog[0];
    let fileName = filePath.split("\\").pop();
    let fileContent = fs.readFileSync(filePath);
    console.log(
      `File Path: ${filePath}\nFile Name: ${fileName}\nFile Content: ${fileContent}`
    );

    event.returnValue = [filePath, fileName, fileContent.toString()];
  } catch {}
});

ipcMain.on("save-file", (event, arg) => {
  try {
    console.log("Save file event received.");
    console.log(`File Path: ${arg[0]}\nContent: ${arg[1]}`);
    fs.writeFileSync(arg[0], arg[1]);
  } catch {}
});
