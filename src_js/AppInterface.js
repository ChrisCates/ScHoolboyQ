"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var Server_1 = require("./Server");
var path = require("path");
var AppInterface = /** @class */ (function () {
    function AppInterface() {
        this.window = null;
        this.windowOptions = {
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            useContentSize: true,
            icon: path.join(__dirname, "..", "icons", "q.ico")
        };
    }
    AppInterface.prototype.render = function () {
        var _this = this;
        this.window = new electron_1.BrowserWindow(this.windowOptions);
        this.window.loadURL(path.join("http://localhost:" + Server_1.express_port + "/"));
        this.window.maximize();
        this.window.focus();
        this.window.on('closed', function () {
            _this.window = null;
        });
    };
    AppInterface.prototype.devDebug = function () {
        this.window.webContents.openDevTools();
    };
    return AppInterface;
}());
exports.AppInterface = AppInterface;
