/**
 * Pull Up Flash
 * @author James Grams
 */

const express = require("express");
const proc = require("child_process");
const fs = require("fs");

const PORT = 35274; // Port to run on FLASH
const HTTP_OK = 200;
const HTTP_SERVER_ERROR = 500;
const SUCCESS = "success";
const FAILURE = "failure";
const ASSETS_DIR = "assets/";
const HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

const app = express();

let assetsFolder = "";
let assetsFile = "";
let command = "";
switch(process.platform) {
    case "darwin":
        assetsFolder = HOME + "/Library/Application Support/Pull Up Flash/";
        assetsFile = "flashplayer.dmg";
        break;
    case "win32":
        assetsFolder = HOME + "/AppData/Local/Pull Up Flash/";
        assetsFile = "flashplayer.exe";
        break;
    case "linux":
        assetsFolder = HOME + "/.Pull Up Flash/";
        assetsFile = "flashplayer";
        break;
    default:
        return Promise.reject();
}
if( process.pkg ) {
    if( !fs.existsSync(assetsFolder) ) {
        fs.mkdirSync(assetsFolder, { recursive: true });
    }
    if( !fs.existsSync(assetsFolder + assetsFile ) ) {
        fs.createReadStream(__dirname + "/" + ASSETS_DIR + assetsFile).pipe(fs.createWriteStream(assetsFolder + assetsFile));
        fs.chmodSync(assetsFolder + assetsFile, 0o765); // make executable
    }
}
else {
    assetsFolder = ASSETS_DIR; // can use the local directory if not in a package (packaged assets aren't available to child_process)
}
command = assetsFolder + assetsFile;

/**
 * Run a URL in Flash Player.
 */
app.get("/run", (request, response) => {
    console.log( "serving /run with query " + JSON.stringify(request.query) );
    try {
        launchFlash(request.query.url);
        writeResponse(response, SUCCESS);
    }
    catch(err) {
        console.log(err);
        writeResponse(response, FAILURE, null, HTTP_SERVER_ERROR);
    }
    
});

/**
 * Send a response to the user.
 * @param {Response} response - The response object.
 * @param {string} status - The status of the request.
 * @param {Object} object - An object containing values to include in the response.
 * @param {number} code - The HTTP response code (defaults to 200).
 * @param {string} contentType - The content type of the response (defaults to application/json).
 */
function writeResponse( response, status, object, code, contentType ) {
    if( !code ) { code = HTTP_OK; }
    if( !contentType ) { contentType = "application/json"; }
    if( !object ) { object = {}; }
    response.writeHead(code, {'Content-Type': 'application/json'});
    
    let responseObject = Object.assign( {status:status}, object );
    response.end(JSON.stringify(responseObject));
}

/**
 * Launch Flash Player.
 * @param {string} url - The url to launch from.
 * @returns {Promise} - A resolved promise.
 */
function launchFlash( url ) {
    if( !url ) return Promise.reject();

    proc.execFile(command, [url]);
    return Promise.resolve();
}

app.listen(PORT);