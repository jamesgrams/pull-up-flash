/**
 * Installer file for Pull Up Flash
 * @author James Grams
 * 
 * The entire purpose of this file is to allow pkg to bundle index.js with command line args
 */

const proc = require("child_process");
proc.fork(__dirname + "/" + "index.js", ["--install"]);