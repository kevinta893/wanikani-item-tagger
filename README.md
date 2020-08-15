# wanikani-item-tagger
A userscript that allows you to tag WaniKani items and export them as CSV lists

## Installation

You can get install from Greasy Fork here: <TBD>

## How to use

🚧 Currently can be used on the following pages on Wanikani.com:

* During Lessons
* During Reviews
* On individual Definition pages for each review item (radicals, kanji, vocabulary)

## Development

This section is for development only. You do not need to follow these steps if you are simply using this script.

To compile the source code into a distributable userscript file, use the ```gulp``` or ```gulp build``` command.

This command requires *nodejs*, *npm*, and *gulp* to be installed. Note that both a global and local package of gulp needs to be installed.

### Installation

1. Install [nodejs and npm](https://nodejs.org/)
2. Install [gulp-cli](https://gulpjs.com/docs/en/getting-started/quick-start/) globally
3. In the folder of this repository, run the ```npm install`` command to fetch all dependant packages
4. Run ```gulp``` to build
5. You should now have a *dist/* folder with the compiled userscript

### Libraries Used

* jQuery (built-in Tampermonkey)
* [pickr@1.7.2](https://github.com/Simonwep/pickr)
