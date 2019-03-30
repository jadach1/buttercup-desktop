import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { getWindowManager } from './window-manager';
import { app, ipcMain } from 'electron';
import { isLinux } from '../../shared/utils/platform';
import path from 'path';

const chalk = require('chalk');
const windowManager = getWindowManager();
let __updateWin;

if (process.env.NODE_ENV !== 'production') {
  autoUpdater.updateConfigPath = path.join(
    __dirname,
    '../../../dev-app-update.yml'
  );
}

console.log(chalk.red('******************we are inside updater'));
// Set logger
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Configure updater
autoUpdater.allowPrerelease = false;
autoUpdater.autoDownload = false;

autoUpdater.on('update-available', ({ version, releaseNotes }) => {
  console.log(
    chalk.red(
      '******************we are inside auto updater part 1 ' +
        version +
        ' ' +
        releaseNotes
    )
  );
  if (__updateWin) {
    return;
  }
  __updateWin = windowManager.buildWindowOfType('update', win => {
    win.webContents.send('update-available', {
      version,
      releaseNotes,
      currentVersion: app.getVersion(),
      canUpdateAutomatically: !isLinux()
    });
    console.log(
      chalk.red('******************we are inside auto updater part 2')
    );
  });
  __updateWin.on('close', () => {
    __updateWin = null;
  });
});

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall();
});

autoUpdater.on('download-progress', progress => {
  if (__updateWin) {
    __updateWin.webContents.send('download-progress', progress);
  }
});

autoUpdater.on('error', error => {
  if (__updateWin) {
    __updateWin.webContents.send('******************update-error', error);
  }
});

ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate();
});

export function checkForUpdates() {
  console.log(
    chalk.red('******************we are inside line 57 check for updates')
  );
  //if (process.env.NODE_ENV === 'production') {
  autoUpdater.checkForUpdates();
  //}
}
