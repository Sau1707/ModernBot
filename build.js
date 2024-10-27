const fs = require('fs');
const path = require('path');

// Define paths
const distPath = path.join(__dirname, 'dist/modernbot.user.js');
const modulesPath = path.join(__dirname, 'new/modules');
const menuPath = path.join(__dirname, 'new/menu.js');
const indexPath = path.join(__dirname, 'new/index.js');
const utilsPath = path.join(__dirname, 'new/utils.js');
const windowPath = path.join(__dirname, 'new/window.js');
const stylePath = path.join(__dirname, 'new/style.css');

// Function to get the new version number
function getNextVersion() {
    let version = '0.0.1';

    // Check if the dist file already exists to retrieve the current version
    if (fs.existsSync(distPath)) {
        const content = fs.readFileSync(distPath, 'utf-8');
        const versionMatch = content.match(/@version\s+(\d+\.\d+\.\d+)/);
        if (versionMatch) {
            const [major, minor, patch] = versionMatch[1].split('.').map(Number);
            version = `${major}.${minor}.${patch + 1}`; // Increment patch version by 1
        }
    }

    return version;
}

// Determine if the version should be updated based on the command-line argument
const shouldUpdateVersion = process.argv.includes('--version');
const version = shouldUpdateVersion ? getNextVersion() : '1.0.0'; // Default version if not updating

// Header template with conditional version
const header = `// ==UserScript==
// @name         ModernBot
// @version      ${version}
// @description  A modern grepolis bot
// @match        http://*.grepolis.com/game/*
// @match        https://*.grepolis.com/game/*
// @updateURL    https://github.com/Sau1707/ModernBot/blob/main/dist/merged.user.js
// @downloadURL  https://github.com/Sau1707/ModernBot/blob/main/dist/merged.user.js
// @icon         https://raw.githubusercontent.com/Sau1707/ModernBot/main/img/gear.png
// @require      http://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==

(function () {
    'use strict';
    var uw;
    if (typeof unsafeWindow == 'undefined') {
        uw = window;
    } else {
        uw = unsafeWindow;
    }

    // Dynamically add CSS
    var style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = \`${fs.readFileSync(stylePath, 'utf-8').replace(/`/g, '\\`')}\`;
    document.head.appendChild(style);
`;

// Ensure dist folder exists
if (!fs.existsSync(path.dirname(distPath))) {
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
}

// Write header and style to the output file
fs.writeFileSync(distPath, header);

// Append utils.js
[utilsPath, windowPath].forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    fs.appendFileSync(distPath, `\n\n// File: ${fileName}\n${content}`);
});

// Read and append each module file
fs.readdirSync(modulesPath).forEach(file => {
    const filePath = path.join(modulesPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    fs.appendFileSync(distPath, `\n\n// Module: ${file}\n${content}`);
});

// Append menu.js and index.js
[menuPath, indexPath].forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    fs.appendFileSync(distPath, `\n\n// File: ${fileName}\n${content}`);
});

fs.appendFileSync(distPath, `\n})();`);
if (shouldUpdateVersion) {
    console.log(`modernbot.user.js created successfully in /dist with version ${version}.`);
}

