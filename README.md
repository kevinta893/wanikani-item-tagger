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

To compile the source code into a distributable userscript file, use the ```npm run gulp``` or ```npm run gulp build``` command.

This command requires *nodejs*, *npm*, and *gulp* to be installed. Note that both a global and local package of gulp needs to be installed.

### Installation

#### First-time setup

**Phase 1: Install**

1. Install [nodejs and npm](https://nodejs.org/)
2. In the folder of this repository, run the ```npm install`` command to fetch all dependant development packages
3. Run ```npm run gulp``` to build
4. You should now have a *output/* folder with the compiled userscript

**Phase 2: Quality of life for developement**

5. Open the userscript in your browser to install it as a *new script*
6. Open the userscript in your favorite editor and copy the meta information
7. Replace the script in Tampermonkey with only the header information from step (7.)
8. Add ```[Dev]``` to the *@name* header of the userscript (separates script for development)
9. Add the following header to the metadata: ```// @require     file:///LOCATION/OF/YOUR/REPOSITORY/wanikani-item-tagger/output/Wanikani%20Item%20Tagger.user.js```
10. Save. Now everytime you build the changes to the script will be reflected in your browser on page refresh

#### Building

Build with the ```npm run gulp``` or ```npm run gulp build``` command.


### Libraries Used

* jQuery (built-in Tampermonkey)
* [pickr@1.7.2](https://github.com/Simonwep/pickr)
