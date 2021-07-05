/**
 * Pull Up Flash
 * @author James Grams
 */

// TODO
// Never quit - catch errors and restart

/******************************* Configuration *******************************/

const express = require("express");
const proc = require("child_process");
const fs = require("fs");
const path = require("path");
const sudo = require('sudo-prompt');
const extractDmg = require("extract-dmg");
let windowManager;
let startOnBoot;
if( process.platform === "win32" || process.platform === "darwin" ) {
    windowManager = require("node-window-manager").windowManager;
    if( process.platform === "win32" ) {
        startOnBoot = require('start-on-windows-boot');
    }
}

const PORT = 35274; // Port to run on FLASH
const HTTP_OK = 200;
const HTTP_SERVER_ERROR = 500;
const SUCCESS = "success";
const FAILURE = "failure";
const ASSETS_DIR = "assets" + path.sep;
const HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
const MAX_TRIES = 200;
const NAME = "Pull Up Flash";
const INSTALLER_TITLE = "pull-up-flash-installer";
const TITLE = "pull-up-flash";
const INVISIBLE_VBS = "invisible.vbs";
const STARTUP_BAT = "startup.bat";
const SERVICE_NAME_LINUX = "pull-up-flash";
const SERVICE_FILENAME_LINUX = `${SERVICE_NAME_LINUX}.service`;
const SERVICE_LOCATION_LINUX = `/etc/systemd/system/${SERVICE_FILENAME_LINUX}`;
const PROMPT_TITLE = "Pull Up Flash";
const MAC_OS_FLASH_FOLDER_NAME = "Flash Player";
const MAC_ID = "net.game103.pull-up-flash";
const MAC_PLIST = `${HOME}/Library/LaunchAgents/${MAC_ID}.plist`;

let execFile = "";
let argv = require("minimist")(process.argv.slice(2));
let assetsFolder = "";
let assetsFile = "";
let zippedAssetsFile = "";
let command = "";
switch(process.platform) {
    case "darwin":
        assetsFolder = HOME + "/Library/Application Support/Pull Up Flash/";
        zippedAssetsFile = "flashplayer.dmg";
        assetsFile = "Flash Player/Flash Player.app/Contents/MacOS/Flash Player"; // assets file is used as a name in most places, so we have to be sure to use zipped assets file in those places
        break;
    case "win32":
        assetsFolder = HOME + "\\AppData\\Local\\Pull Up Flash\\";
        assetsFile = "flashplayer.exe";
        break;
    case "linux":
        assetsFolder = HOME + "/.Pull Up Flash/";
        assetsFile = "flashplayer";
        break;
    default:
        return Promise.reject();
}
if( !process.pkg && !argv.install ) {
    assetsFolder = ASSETS_DIR; // can use the local directory if not in a package (packaged assets aren't available to child_process)
}
command = assetsFolder + assetsFile;

/******************************* Functions *******************************/

/**
 * Main function.
 */
 async function main() {
    // The installer will copy itself to the assets folder
    // once there, we don't want it to install next time - we want it to run.
    let execFolder = process.execPath;
    execFolder = process.execPath.split(path.sep);
    execFile = execFolder.pop();
    execFolder = execFolder.join(path.sep) + path.sep;

    // set up needed files to run standalone or not
    if( !fs.existsSync(assetsFolder) ) {
        fs.mkdirSync(assetsFolder, { recursive: true });
    }
    if( !fs.existsSync( assetsFolder + assetsFile ) ) {
        let binaryToCopy = process.platform === "darwin" ? zippedAssetsFile : assetsFile;
        // Copy the binary, installer script and the assets file over
        await copyFile( __dirname + path.sep + ASSETS_DIR + binaryToCopy, assetsFolder + binaryToCopy );

        if( process.platform === "darwin" ) {
            if( !fs.existsSync( assetsFolder + MAC_OS_FLASH_FOLDER_NAME ) ) {
                await extractDmg( assetsFolder + zippedAssetsFile, assetsFolder + MAC_OS_FLASH_FOLDER_NAME );
                if( process.pkg ) {
                    fs.unlinkSync( assetsFolder + zippedAssetsFile );
                }
            }
        }
    }
    if( process.platform === "darwin" ) {
        windowManager.requestAccessibility();
    }

    if( argv.install && execFolder !== assetsFolder ) await install();
    else run();
}
main();

/**
 * Install.
 * Note install will only really work if packaged, since we copy the binary.
 * The binary for non-packaged is node.js
 */
async function install() {
    process.title = INSTALLER_TITLE;

    function complete() {
        console.log("Process is complete. You can delete the installer if you like.");
        if( process.platform === "win32" ) {
            console.log("Press any key to exit...");
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.on('data', process.exit.bind(process, 0));
        }
    }

    let sudoCommands = [];
    console.log("---------------------------------------------------------");
    console.log("--------------------Pull Up Flash------------------------");
    console.log("---------------------------------------------------------");
    // Copy all the files to the real file system
    console.log("Detecting existing installation");
    if( !fs.existsSync(assetsFolder+execFile) ) {
        console.log("No existing installation found. Installing...");
        console.log("Copying files...");
        // Copy the pull up flash binary
        let binary = process.execPath;
        let binaryFilename = binary.split(path.sep);
        binaryFilename = binaryFilename[binaryFilename.length-1];
        await copyFile( binary, assetsFolder + binaryFilename );

        console.log("Writing autostart files...");
        let startupCommand = "";
        switch( process.platform ) {
            case "win32":
                // copy the invisible vbs
                await copyFile(__dirname + path.sep + ASSETS_DIR + INVISIBLE_VBS, assetsFolder + INVISIBLE_VBS);
                startupCommand = `wscript.exe "${assetsFolder + INVISIBLE_VBS}" "${assetsFolder + binaryFilename}"`;
                // pkg cannot access wscript.exe, so we have to run a BAT file.
                // start up will not require this
                fs.writeFileSync(assetsFolder + STARTUP_BAT, startupCommand);
                break;
            case "linux":
                fs.writeFileSync( assetsFolder + SERVICE_FILENAME_LINUX, `[Unit]
Description=Click to open flash content on web pages in Flash Player

[Service]
Type=simple
ExecStart="${assetsFolder + binaryFilename}"
User=${process.env.USER}
Environment=DISPLAY=:0

[Install]
WantedBy=multi-user.target`);
                let saveDir = SERVICE_LOCATION_LINUX.split(path.sep);
                saveDir.pop();
                saveDir = saveDir.join(path.sep);
                sudoCommands.push(`mv "${assetsFolder + SERVICE_FILENAME_LINUX}" "${saveDir}"`);
                break;
            case "darwin":
                fs.writeFileSync( MAC_PLIST, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${MAC_ID}</string>
    <key>ProgramArguments</key>
    <array><string>${assetsFolder + binaryFilename}</string></array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>`);
                break;
        }

        console.log("Enabling autostart...");
        switch( process.platform ) {
            case "win32":
                startOnBoot.enableAutoStart( NAME, startupCommand, complete );
                break;
            case "linux":
                sudoCommands.push(`systemctl enable ${SERVICE_NAME_LINUX}`);
                break;
            case "darwin":
                proc.execSync(`launchctl load "${MAC_PLIST}"`);
                break;
        }

        console.log("Starting instance...");
        switch( process.platform ) {
            case "win32":
                proc.spawn( assetsFolder + STARTUP_BAT, {
                    detached: true
                } );
                break;
            case "linux":
                sudoCommands.push(`systemctl start ${SERVICE_NAME_LINUX}`);
                await sudoRun( sudoCommands.join(" && ") );
                complete();
                break;
            case "darwin":
                //proc.execSync(`launchctl start "${MAC_PLIST}"`);
                complete();
                break;
        }
    }
    else {
        console.log("Existing installation found. Uninstalling...");

        console.log("Stopping any current instance...");
        try {
            switch( process.platform ) {
                case "win32":
                    proc.execSync(`taskkill /FI "WINDOWTITLE ne ${INSTALLER_TITLE}" /IM ${execFile} /F /T`);
                    break;
                case "linux":
                    sudoCommands.push(`systemctl stop ${SERVICE_NAME_LINUX}`);
                    break;
                case "darwin":
                    proc.execSync(`launchctl stop "${MAC_PLIST}"`);
                    break;
            }
        }
        catch(err) {
            // ok
        }

        console.log("Deleting files...");
        try {
            fs.rmdirSync(assetsFolder, { recursive: true });
        }
        catch(err) {
            // ok
        }

        console.log("Disabling autostart...");
        switch( process.platform ) {
            case "win32":
                startOnBoot.disableAutoStart( NAME, complete );
                break;
            case "linux":
                sudoCommands.push(`systemctl disable ${SERVICE_NAME_LINUX}`);
                sudoCommands.push(`rm -rf "${SERVICE_LOCATION_LINUX}"`);
                await sudoRun( sudoCommands.join(" && ") );
                complete();
                break;
            case "darwin":
                proc.execSync(`launchctl unload "${MAC_PLIST}"`);
                fs.unlinkSync(MAC_PLIST);
                complete();
                break;
        }
    }

    return Promise.resolve();
}

/**
 * Run a command as sudo.
 * @param {string} command - The command to run.
 */
function sudoRun(command) {
    return new Promise( ( resolve, reject ) => {
        sudo.exec(command, {
            name: PROMPT_TITLE
        }, (error, stdout, stderr) => {
            if( error ) {
                console.log(error);
                reject();
            }
            resolve();
        });
    } );
}

 /**
  * Copy a file in such a way that won't crash pkg by making system calls
  * @param {string} source - The source file location.
  * @param {string} destination - The destination file location.
  */
function copyFile( source, destination ) {
    return new Promise( (resolve, reject) => {
        try {
            fs.createReadStream(source).pipe(fs.createWriteStream(destination)).on("finish", () => {
                fs.chmodSync(destination, 0o755); // make executable
                resolve();
            });
        }
        catch(err) {
            reject(err);
        }
    } );
}

/**
 * Run the server.
 */
function run() {
    process.title = TITLE;

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
        if( process.platform === "win32" || process.platform === "darwin" ) {
            let neededWindowLength = process.platform === "win32" ? 2 : 1;
            function focus() {
                tries ++;
                if( tries > MAX_TRIES ) return;
                let window = windowManager.getWindows().filter(el => el.processId === spawned.pid  && el.getBounds().width > 0);
                if( window.length < neededWindowLength ) setTimeout( focus, 50 );
                else window[0].bringToTop();
            }
            focus();
        }
    }
    catch(err) {
        console.log(err);
    }
    return Promise.resolve();
}