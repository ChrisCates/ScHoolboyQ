import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';

export const express_dir = __dirname;
export const express_port = process.env.EXPRESS_PORT || 9001;
export const express_app = express();
export const app_directory = path.join(__dirname, "..", "ui", "dist", "ScHoolboyQ")

express_app.use(express.static(app_directory));

express_app.post('/fs', (req, res) => {
 return res.status(200).send("Yo this is the filesystem dawg");
})

express_app.get('*', (req, res) => {
 return res.sendFile(__dirname + "/dist/index.html");
});

console.log("ScHoolboy Q REST RPC running on", express_port);

express_app.listen(express_port);
