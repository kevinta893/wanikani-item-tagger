/**
 * Creates a tagger UI based on the page
 * that the script is current on
 */
class TaggerUiFactory {
  static createTaggerUi(): TagView {
    //Create UI (depending on page)
    var pageUrl = window.location.href;

    if (pageUrl.indexOf('wanikani.com/review/session') >= 0) {
      return new ReviewTaggerView();
    }

    if (pageUrl.indexOf('wanikani.com/lesson/session') >= 0) {
      return new LessonTaggerView();
    }

    if (
      pageUrl.indexOf('wanikani.com/radicals') >= 0 ||
      pageUrl.indexOf('wanikani.com/kanji') >= 0 ||
      pageUrl.indexOf('wanikani.com/vocabulary') >= 0
    ) {
      //Wanikani item definition pages
      return new DefinitionTaggerView();
    }

    //No match
    throw new Error('Cannot create UI, invalid page.');
  }
}