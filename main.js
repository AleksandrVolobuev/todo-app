const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const TASKS_FILE = path.join(__dirname, "tasks.json");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile("index.html");
  
  // Раскомментируйте для отладки:
  // win.webContents.openDevTools();
  
  return win;
}

// Загрузка задач
ipcMain.handle("load-tasks", () => {
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, "utf8"));
  } catch {
    // Создаем файл если его нет
    const defaultTasks = { day: [], week: [], month: [] };
    fs.writeFileSync(TASKS_FILE, JSON.stringify(defaultTasks, null, 2));
    return defaultTasks;
  }
});

// Сохранение задач
ipcMain.handle("save-tasks", (event, tasks) => {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
    return { success: true };
  } catch (error) {
    console.error("Ошибка сохранения:", error);
    return { success: false, error: error.message };
  }
});

// Выход из приложения
ipcMain.on("exit-app", () => {
  app.quit();
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});