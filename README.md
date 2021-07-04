# Pull Up Flash

Click to open flash content on web pages in Flash Player. This lets you run flash games and movies you come across online in 2021 and beyond in Chromium-based browsers (Google Chrome, Edge, Brace, Vivaldi, etc.).

## Installation

### Requirements

You will need Windows or Linux. Mac is a work in progress.

## Installing/Running

1. Download and run the appropriate binary for your operating system from the releases section.
    * The standalone version will simply run while the window is open. The non-standalone version will install a silent background process that persists through reboot.
    * On Mac and Linux, you will likely have to make the file executable.
    * On linux, if you run from the GUI by double clicking the file, you likely won't see a window, but it will still install!
2. Open/run the file. If using the non-standalone version, you can run the file again to uninstall.
3. Install the [Chrome Extension](https://github.com/jamesgrams/pull-up-flash-extension) in your browser.

### Additonal Notes

*. On Ubuntu with Nvidia drivers, you may get some strange displays. You will need to disable hardware acceleration by right clicking the game/movie in Flash Player > Settings > Disable Hardware Acceleration.

## Building

You will need npm and Node.js installed. You will also need `pkg` installed (`npm install -g pkg`).

1. Download this repository
2. `cd` to this repository
3. Run `npm install`
    * Note: You need the version of node on your computer to match the version of node `pkg` will bundle.
4. Run `npm build`
5. The binaries will be located in the `dist` folder.

Note: You should build the binaries on the platform you're building for. Specifically Windows, which has some dependencies that aren't installed on Linux and Mac during `npm install`, so they would not be bundled in the binary.

## Testing

You can simply run `npm start` after running `npm install` to test. You can use the `--install` flag too, but it may not work. The installer is designed to be run from the `pkg`ed version.

## Full Description

The Flash Player web plugin is no longer supported, but Flash player for desktop is still [distributed by Adobe](https://www.adobe.com/support/flashplayer/debug_downloads.html). Pull Up Flash allows you to easily run Flash content by replacing it on web pages with a button you can click to open the game or movie in Flash Player for desktop.

## Tested Sites

### Working
* https://maxgames.com
* https://crazymonkeygames.com
* https://bigdino.com
* https://onemorelevel.com
* https://andkon.com
* https://y8.com
* https://game103.net

### Not Working
* https://newgrounds.com
* https://kongregate.com

![Pull Up Flash Logo](./assets/logo.png)