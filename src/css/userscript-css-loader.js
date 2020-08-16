/**
 * Loads the CSS for the userscript
 * Expects a global variable 'userscriptCss' with the contents
 * of the CSS to add
 * Requires GM_addStyle permission
 */
class UserscriptCSSLoader {

  static loadUserScriptCss(){
    GM_addStyle(userscriptCss);
  }
}