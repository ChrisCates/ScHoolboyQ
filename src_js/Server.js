"use strict";
exports.__esModule = true;
var express = require("express");
var path = require("path");
exports.express_port = process.env.EXPRESS_PORT || 9001;
exports.express_app = express();
exports.directory = path.join(__dirname, "..", "ui", "dist", "ScHoolboyQ");
exports.express_app.use(express.static(exports.directory));
exports.express_app.post('/fs', function (req, res) {
    return res.status(200).send("Yo this is the filesystem dawg");
});
exports.express_app.get('*', function (req, res) {
    return res.sendFile(__dirname + "/dist/index.html");
});
console.log("ScHoolboy Q REST RPC running on", exports.express_port);
exports.express_app.listen(exports.express_port);
