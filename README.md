# Pull Up Flash

Click to open flash content on web pages in Flash Player. This lets you run flash games and movies you come across online in 2021 and beyond in Chromium-based browsers (Google Chrome, Edge, Brace, Vivaldi, etc.).

## Installation

### Requirements

You will need npm and Node.js installed (for now).

1. Download this repository
2. Run `npm install -g pm2` to install pm2 (may need to run as root)
3. If on Windows, run `npm install -g pm2-windows-startup`
4. `cd` to this repository
5. Run `npm install`
6. Run `pm2 start index.js` 
7. Run `pm2-startup install` on Windows or `pm2 startup` on other platforms.
8. Run `pm2 save`
9. Install the [Chrome Extension](https://github.com/jamesgrams/pull-up-flash-extension) in your browser.

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