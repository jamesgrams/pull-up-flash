# Pull Up Flash

## Video

<p align="center">
   <a target="_blank" href="https://www.youtube.com/watch?v=pjKf-pMySpI">
      <img src="https://img.youtube.com/vi/pjKf-pMySpI/0.jpg" alt="Pull Up Flash Intro Video"/>
   </a>
</p>

## Summary

Pull Up Flash lets you run flash games and movies you come across online in 2021 and beyond in Chromium-based browsers (Google Chrome, Edge, Brace, Vivaldi, etc.) and Firefox.

## Files

| Platform | Type       | Link      |
|:---------|:-----------|:----------|
| Windows  | Installer  | [Download](https://github.com/jamesgrams/pull-up-flash/releases/download/1.0.0/pull-up-flash-win.exe) |
| Windows  | Standalone | [Download](https://github.com/jamesgrams/pull-up-flash/releases/download/1.0.0/pull-up-flash-win-standalone.exe) |
| MacOS    | Installer  | [Download](https://github.com/jamesgrams/pull-up-flash/releases/download/1.0.0/pull-up-flash-macos.zip) |
| MacOS    | Standalone | [Download](https://github.com/jamesgrams/pull-up-flash/releases/download/1.0.0/pull-up-flash-macos-standalone.zip) |
| Linux    | Installer  | [Download](https://github.com/jamesgrams/pull-up-flash/releases/download/1.0.0/pull-up-flash-linux.zip) |
| Linux    | Standalone | [Download](https://github.com/jamesgrams/pull-up-flash/releases/download/1.0.0/pull-up-flash-linux-standalone.zip) |

## Installation

### Requirements

Pull Up Flash works on Windows, Mac, and Linux. 64-bit architecture is required.

### Steps

1. Download the appropriate binary for your operating system from the [releases section](https://github.com/jamesgrams/pull-up-flash/releases) or by clicking the link above.
    * The standalone version will run while the window is open. The installer version will install a silent background process that persists through reboot.
    * On Mac and Linux, you will have to unzip the file.
2. Open/run the file. If using the installer version, you can run the file again to uninstall.
    * On Mac, you may need to grant Accessibility permission. This is to allow Pull Up Flash to bring windows to the front.
    * On Linux, you will be prompted for your root password (only in installer mode), in order to add your program as a startup service.
    * On Linux, if you run from the GUI by double-clicking the file, you likely won't see a window, but it will still install!
3. Install the [Browser Extension](https://github.com/jamesgrams/pull-up-flash-extension).

### Additional Notes

* On Ubuntu with Nvidia drivers, you may get some strange displays. You will need to disable hardware acceleration by right clicking the game/movie in Flash Player > Settings > Disable Hardware Acceleration.

## Full Description

The Flash Player web plugin is no longer supported, but Flash player for desktop is still [distributed by Adobe](https://www.adobe.com/support/flashplayer/debug_downloads.html). Pull Up Flash allows you to easily run Flash content by replacing it on web pages with a button you can click to open the game or movie in Flash Player for desktop.

## Tested Sites

### Working
* [andkon.com](https://andkon.com)
* [bigdino.com](https://bigdino.com)
* [crazymonkeygames.com](https://crazymonkeygames.com)
* [freewebarcade.com](https://freewebarcade.com)
* [game103.net](https://game103.net)
* [maxgames.com](https://maxgames.com)
* [newgrounds.com](https://newgrounds.com)
* [notdoppler.com](http://www.notdoppler.com)
* [onemorelevel.com](https://onemorelevel.com)
* [primarygames.com](https://www.primarygames.com)
* [xgenstudios.com](http://www.xgenstudios.com)
* [y8.com](https://y8.com)

### Not Working
* [coolmathgames.com](https://coolmathgames.com)
* [kongregate.com](https://kongregate.com)

## For Developers

### Building

You will need npm and Node.js installed. You will also need `pkg` installed (`npm install -g pkg`).

1. Download this repository
2. `cd` to this repository
3. Run `npm install`
    * Note: You need the version of node on your computer to match the version of node `pkg` will bundle.
4. Run `npm build`
5. The binaries will be located in the `dist` folder.

Note: You should build the binaries on the platform you're building for. Specifically Windows, which has some dependencies that aren't installed on Linux and Mac during `npm install`, so they would not be bundled in the binary.

### Testing

You can simply run `npm start` after running `npm install` to test. You can use the `--install` flag too, but it may not work. The installer is designed to be run from the `pkg`ed version.

<p align="center">
  <img src="./assets/logo.png" alt="Pull Up Flash Logo" width="128"/>
</p>
