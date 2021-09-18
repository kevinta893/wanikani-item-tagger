class TagConfigLauncherFactory {

  /**
   * Creates a tagger UI based on the page
   * that the script is current on
   */
  static createConfigUi(): TagConfigLauncher {
    var pageUrl = window.location.href;

    if (
      pageUrl == 'https://www.wanikani.com/' ||
      pageUrl.indexOf('wanikani.com/dashboard') >= 0
    ) {
      return new DashboardConfigLauncher();
    }

    if (
      pageUrl.indexOf('wanikani.com/radicals') >= 0 ||
      pageUrl.indexOf('wanikani.com/kanji') >= 0 ||
      pageUrl.indexOf('wanikani.com/vocabulary') >= 0
    ) {
      //Wanikani item definition pages
      return new DefinitionConfigLauncher();
    }

    return new NullConfigLauncher();
  }
}