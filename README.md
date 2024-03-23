# <div align="center"> Grepolis ModernBot </div>

### <p align="center"> If you like this project, please consider starring it to show your support and help others discover it too </p>

### <div align="center"> [Website](https://sau1707.github.io/ModernBot/) - [Donations](https://paypal.me/sau1707) </div>


## Development

### Contributing

The `main` branch has the stable version of the bot. The `dev` branch has the latest changes and it's the one that should be used for development.

Fork the repository and clone it to your local machine. Create a new branch from `dev` and make your changes. Once you're done, submit a pull request to the `dev` branch of the original repository.

### Script

The script it's divided in modules under the `src` directory.

by running in the main folder

```
npm install
npm run dev
```

it will create a [gulp](https://gulpjs.com/docs/en/getting-started/quick-start/) server that listen to changes in the code. Each time a file it's saved all the modules are merged into one under the dist folder

Place this into a tampermokey script:

```
// ==UserScript==
// @name         GrepoTest
// @author       Sau1707
// @description
// @version      1.0.0
// @match        http://*.grepolis.com/game/*
// @match        https://*.grepolis.com/game/*
// @require      file://C:\[path]\ModernBot\dist\merged.user.js
// ==/UserScript==
```

In case of loading error `@require: couldn't load ` go to

```
chrome://extensions/
```

Then select tampermoney and add `Allow access to file URLs`

### Website

The website dynamicall load the content of `markdown` folder and generate a box for each one of them

The title of the file it's the title of the module, the other details has to be set as follow.

```
---
description:
version:
---

[Content of the popup]
```

In order to run the website locally:

```
cd website
npm install
npm run dev
```

### Version

The version get automatically updated every time it's done a commit, the version works as follow:

-   1.[src_file_count].[numbers_of_commits]

If the file count it's the same, +1 to the numbers_of_commits it's added \
If the file count increase (a new module it's added) then the version will be 1.[src_file_count + 1].0

## Disclaimer

This open-source bot is designed for use with Grepolis, a video game developed by InnoGames. However, please note that this bot is not endorsed or approved by InnoGames, and the use of this bot may be against the game's terms of service. We do not encourage or condone the use of this bot to gain an unfair advantage or violate the game's rules.

The use of this bot is entirely at your own risk, and we accept no liability for any consequences that may arise from its use. By using this bot, you acknowledge and accept that InnoGames may take action against your account for violating their terms of service. We strongly recommend that you read and understand the game's rules before using this bot.

Additionally, this bot is provided as open-source software, and we do not offer any technical support or assistance in its installation, configuration, or use. You are solely responsible for any modifications or customizations you make to the bot's code, and we accept no responsibility for any issues that may arise as a result.

By using this bot, you acknowledge and accept these terms and conditions and agree to use it responsibly and in accordance with the applicable laws and regulations.

- Icons from [flaticon](https://www.flaticon.com/)
- Website graphics from [grepolis](https://grepolis.com)