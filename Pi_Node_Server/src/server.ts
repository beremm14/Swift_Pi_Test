// Node.js Modul
import * as path from 'path';

// Externes Modul (via npm installieren)
import * as express from 'express';
import * as bodyParser from 'body-parser';

export class Server {
private _port: number;
private _server: express.Express;

    constructor (port: number) {
        const assetsPath = path.join(__dirname, '..', 'assets');

        this._port = port;
        this._server = express();

        // Alle Dateien im assets-Ordner verwenden
        this._server.use('/', express.static(assetsPath));

        this._server.use(bodyParser.json());
        this._server.use(bodyParser.urlencoded());
    }

    public start () {
        this._server.listen(this._port);
        console.log('HTTP Server gestartet auf Port: ' + this._port);
    }

    public get port () {
        return this._port;
    }


}
