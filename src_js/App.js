"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var AppInterface_1 = require("./AppInterface");
var appInterface = new AppInterface_1.AppInterface();
electron_1.app.on('ready', function () {
    appInterface.render();
    appInterface.devDebug();
});
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    if (electron_1.app === null) {
        appInterface.render();
    }
});
