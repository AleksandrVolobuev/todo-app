const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const TASKS_FILE = path.join(__dirname, 'tasks.json');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
  });
  win.loadFile('index.html');
}

ipcMain.handle('load-tasks', () => {
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  } catch {
    return { day: [], week: [], month: [] };
  }
});

ipcMain.handle('save-tasks', (event, tasks) => {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { 
  if (process.platform !== 'darwin') app.quit(); 
});