/**
 * Pull Up Flash
 * @author James Grams
 */

/******************************* Configuration *******************************/

const express = require("express");
const proc = require("child_process");
const fs = require("fs");
const windowManager = require("node-window-manager").windowManager;
const minimist = require("minimist");
const pm2 = require("pm2");

const PORT = 35274; // Port to run on FLASH
const HTTP_OK = 200;
const HTTP_SERVER_ERROR = 500;
const SUCCESS = "success";
const FAILURE = "failure";
const ASSETS_DIR = "assets/";
const HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
const MAX_TRIES = 200;
const SCRIPT_FILE = "index.js";

let argv = require("minimist")(process.argv.slice(2));
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
// We need the last argument, since we will run the script as a .js file extracted to app data
// so pkg will be false, no cli with no pkg mean we run, but when we run we want to use the other destinations
if( !process.pkg && !argv.install && fs.existsSync(ASSETS_DIR) ) {
    assetsFolder = ASSETS_DIR; // can use the local directory if not in a package (packaged assets aren't available to child_process)
}
command = assetsFolder + assetsFile;

/******************************* Functions *******************************/

/**
 * Main function.
 */
function main() {
    if( argv.run ) run();
    else if( argv.install ) install();
    else if( process.pkg ) install(); // Install by default in the packaged version
    else run();
}
main();

/**
 * Install.
 */
function install() {
    console.log("---------------------------------------------------------");
    console.log("--------------------Pull Up Flash------------------------");
    console.log("---------------------------------------------------------");
    // Copy all the files to the real file system
    console.log("Copying files...");
    if( !fs.existsSync(assetsFolder) ) {
        fs.mkdirSync(assetsFolder, { recursive: true });
    }
    for( let file of [SCRIPT_FILE, assetsFile] ) {
        //if( !fs.existsSync(assetsFolder + file) ) {
            fs.createReadStream(__dirname + "/" + (file == assetsFile ? ASSETS_DIR : "") + file).pipe(fs.createWriteStream(assetsFolder + file)).on("finish", () => {
                fs.chmodSync(assetsFolder + file, 0o755); // make executable
            });
        //}
    }
    // Set up pm2
    console.log("Setting up autostart...");
    pm2.connect( (err) => {
        if( err ) {
            console.log(err);
            return;
        }

        pm2.start({
            script: "index.js",
            name: "pull-up-flash"
        }, (err) => {
            if( err ) {
                console.log(err);
            }
            
            //proc.fork("node_modules/pm2/bin/pm2", ["status"]);
            console.log("Making last through reboot...");
            if( process.platform === "win32" ) {
                proc.fork("node_modules/pm2-windows-startup/index.js", ["install"]);
            }
            else if(process.platform === "linux" ) {
                let child = proc.fork("node_modules/pm2/bin/pm2", ["startup"]);
                let output = "";
                child.stdout.on("data", data => {
                    output += data;
                });
                child.on("exit", () => {
                    try {
                        let command = output.split("\n").filter(e=>e);
                        command = command[command.length - 1];
                        // there is a command
                        if( command.match(/^sudo/) ) {
                            command = command.replace(/^sudo\s/, "sudo -A ");
                            proc.execSync(command);
                        }
                    }
                    catch(err) {
                        // could be ok if they ran as root
                        console.log(err);
                    }
                });
            }
            proc.fork("node_modules/pm2/bin/pm2", ["save"]);

            pm2.disconnect();
            
            setTimeout( () => {
                console.log("Installation is complete. You can delete the installer if you like.");
                console.log("Press any key to exit...");
                process.stdin.setRawMode(true);
                process.stdin.resume();
                process.stdin.on('data', process.exit.bind(process, 0));
            }, 5000 );
        });
    } );
}

/**
 * Run the server.
 */
function run() {
    const app = express();

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

    app.listen(PORT);
}

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

    try {
        let spawned = proc.execFile(command, [url]);
        let tries = 0;
        function focus() {
            tries ++;
            if( tries > MAX_TRIES ) return;
            let window = windowManager.getWindows().filter(el => el.processId === spawned.pid  && el.getBounds().width > 0);
            if( window.length < 2 ) setTimeout( focus, 50 );
            else window[0].bringToTop();
        }
        focus();
    }
    catch(err) {
        console.log(err);
    }
    return Promise.resolve();
}