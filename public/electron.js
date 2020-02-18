const { app, BrowserWindow, ipcMain, dialog } = require("electron");

const path = require("path");
const isDev = require("electron-is-dev");
const fs = require("fs");
const { Document, Paragraph, Packer } = require("docx");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 685,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
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

ipcMain.on("save-new-file", (event, arg) => {
  try {
    console.log("Save new file event received.");
    let saveDialog = dialog.showSaveDialogSync({
      defaultPath: app.getPath("documents") + "/Untitled",
      filters: [
        { name: "Markdown", extensions: ["md"] },
        { name: "Text File", extensions: ["txt"] },
        { name: "Microsoft Word", extensions: ["docx", "doc"] },
        { name: "Rich Text", extensions: ["rtf"] },
        { name: "All files", extensions: ["*"] }
      ]
    });

    let value = "";

    arg.forEach(element => {
      value = value + element.children[0].text + "\n";
    });

    let fileName = saveDialog.split("\\").pop();
    let fileExtension = fileName.split(".").pop();

    if (fileExtension === "docx" || fileExtension === "doc") {
      let doc = new Document();
      doc.addSection({
        children: [
          new Paragraph({
            text: value
          })
        ]
      });

      Packer.toBuffer(doc).then(buffer => {
        fs.writeFileSync(saveDialog, buffer);
      });
    } else {
      fs.writeFileSync(saveDialog, value);
    }

    event.returnValue = fileName.toString();
  } catch (error) {}
});

ipcMain.on("save-file", (event, arg) => {
  try {
    console.log("Save file event received.");
    // [
    //   { children: [{ text: "f" }] },
    //   { children: [{ text: "" }] },
    //   { children: [{ text: "f" }] },
    //   { children: [{ text: "" }] },
    //   { children: [{ text: "f" }] }
    // ];

    let value = "";

    arg[1].forEach(element => {
      value = value + element.children[0].text + "\n";
    });

    fs.writeFileSync(arg[0], value);
  } catch (error) {}
});
