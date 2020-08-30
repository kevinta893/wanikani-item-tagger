/**
 * Loads the CSS for the userscript
 * Expects a global variable 'userscriptCss' with the contents
 * of the CSS to add
 * Requires GM_addStyle permission
 */
class UserscriptCSSLoader {

  static loadUserScriptCss(): void{
    //@ts-ignore: userscriptCss variable is built during compile time
    GM_addStyle(userscriptCss);
  }
}