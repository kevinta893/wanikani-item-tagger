// ==UserScript==
// @name        Wanikani Item Tagger
// @namespace   kevinta893
// @author      kevinta893
// @description Allows you to tag, classify, and organize review items in WaniKani
// @run-at      document-end
// @license     MIT; http://opensource.org/licenses/MIT
// @include     https://www.wanikani.com/
// @include     https://www.wanikani.com/dashboard
// @include     https://www.wanikani.com/review/session
// @include     https://www.wanikani.com/lesson/session
// @include     https://www.wanikani.com/radicals/*
// @include     https://www.wanikani.com/kanji/*
// @include     https://www.wanikani.com/vocabulary/*
// @version     0.0.1
// @run-at      document-end
// @grant       GM.setValue
// @grant       GM.getValue
// @grant       GM.deleteValue
// @grant       GM.listValues
// @grant       GM_addStyle
// @resource    pickr_monolith_style https://cdn.jsdelivr.net/npm/@simonwep/pickr@1.7.2/dist/themes/monolith.min.css
// @require     https://cdn.jsdelivr.net/npm/@simonwep/pickr@1.7.2/dist/pickr.min.js
// @require     https://cdn.jsdelivr.net/npm/papaparse@5.3.0/papaparse.min.js
// @homepage    https://github.com/kevinta893/wanikani-common-vocab-indicator
// @homepageURL https://github.com/kevinta893/wanikani-common-vocab-indicator
// @updateURL   https://github.com/kevinta893/wanikani-item-tagger/raw/master/Wanikani%20Item%20Tagger.user.js
// ==/UserScript==


//Loads user script
async function initialize(): Promise<void> {
  // CSS
  UserscriptCSSLoader.loadUserScriptCss();

  // External Styles
  var pickrMonolithCSS = GM_getResourceText("pickr_monolith_style");
  GM_addStyle(pickrMonolithCSS);

  // Data services
  var dataContext = new TamperMonkeyUserDataContext();
  var userConfigService = new UserConfigService(dataContext);
  var userConfig = await userConfigService.getConfig();
  var reviewItemRepository = new ReviewItemRepository(dataContext);
  var tagRepository = new TagRepository(dataContext);
  var tagService = new ReviewItemService(reviewItemRepository, tagRepository);

  // UI
  var tagView = TaggerUiFactory.createTaggerUi(userConfig);
  var taggerController = new TaggerController(tagView, tagService);

  // Config UI
  var openConfigButtonSelector = TagConfigLauncherFactory.createConfigUi().getOpenConfigButtonId();
  var taggerConfigView = new TagConfigView(openConfigButtonSelector);
  var taggerConfigController = new TagConfigController(taggerConfigView, tagService, userConfigService);

  console.log('Wanikani Item Tagger started.');
}