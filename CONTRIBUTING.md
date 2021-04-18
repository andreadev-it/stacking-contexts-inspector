# CSS Stacking Context Inspector

This devtools extension for Google Chrome and Firefox allows you to inspect all the stacking contexts created in the current tab, along with some useful informations about any particular stacking context and its DOM element.

Thank you for your interest in contributing to the development of this extension! If you found a bug that you want to report, or have a feature request, please post it in the "Issues" section here on github.

This extension uses the following tools:
* **preact** - frontend framework
* **SASS** - CSS preprocessor
* **parcel** - package builder

To simplify the data-passing between the different extension components, the bg-script library is used. To better understand how it should be use, please refer to its [github page](https://github.com/andreadev-it/bg-script).

# Local development

## Prerequisites

To start coding on this project, you should already have `node` and `npm` installed in your system.

## Environment setup

To set up your local environment, clone this repository and launch the following command:
```sh
npm install
```

## Build the extension

There are two npm scripts available to build the extension: `build` and `build-dev`.

To build the extension without code minification, you can launch this command:
```sh
npm run build-dev
```

After testing, when the extension is working, you can prepare a production-ready build by launching the following command:
```sh
npm run build
```

These commands will create a `dist` folder with the compiled code that can be used for testing.

If you find issues related to file not being correctly loaded in the extension, you can try deleting the `dist` and the `.parcel-cache` folders. After that you can run the build command again to create a clean build.

## Test the extension

### Chrome
First, go to the extension page: `chrome://extensions`

Make sure that the toggle "Developer mode" on the top right is active, click on the "Load unpacked" button and select the recently generated `dist` folder. 

When you rebuild the extension, you'll need to go to the extension page and click the "reload" button in the bottom-right corner of the extension card to reflect the changes.

To inspect the devtools extension, just press `CTRL + SHIFT + J` with the devtools window focused. This will open a second devtools window that will let you inspect the first one.

### Firefox
Start by going to the debugging page: `about:debugging`

Now click on the "This Firefox" section on the left, and click on the "Load temporary Add-on" button. Select any file within the `dist` folder to load the extension.

To debug it, you can use the [Firefox Browser Toolbox](https://developer.mozilla.org/en-US/docs/Tools/Browser_Toolbox). Go in the "about:debugging" page and click on the "Analyze" button next to the temporarily loaded extension name.

You might also want to take a look at [this](https://extensionworkshop.com/documentation/develop/debugging/#debugging-developer-tools-pages-and-panels) page for further information that will help you inspect the extension devtools sidebar and panel. 