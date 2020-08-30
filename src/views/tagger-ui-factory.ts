/**
 * Creates a tagger UI based on the page
 * that the script is current on
 */
class TaggerUiFactory {
  static createTaggerUi(): TagView {
    //Add UI (depending on page)
    var pageUrl = window.location.href;
    if (pageUrl.indexOf('wanikani.com/review/session') >= 0) {
      // Review
      return new ReviewTaggerView();
    } else if (pageUrl.indexOf('wanikani.com/lesson/session') >= 0) {
      // Lesson
      throw new Error('Lesson page not yet supported');
      //return new LessonTaggerView();
    } else if (
      pageUrl.indexOf('wanikani.com/radicals') >= 0 ||
      pageUrl.indexOf('wanikani.com/kanji') >= 0 ||
      pageUrl.indexOf('wanikani.com/vocabulary') >= 0
    ) {
      //Wanikani item definition pages
      return new DefinitionTaggerView();
    } else {
      //No match
      throw new Error('Cannot create UI, invalid page.');
    }
  }
}