class TaggerController {
  reviewItemService;
  tagInputField;
  tagList;
  tagView;

  constructor(tagView, reviewItemService) {
    this.reviewItemService = reviewItemService;
    this.tagView = tagView;

    //Listen to tag add or remove events, save updated tags
    this.tagView.bindTagAdded((reviewItemViewModel, addedTagViewModel) => {
      this.addTag(reviewItemViewModel, addedTagViewModel);
    });
    this.tagView.bindTagRemoved((reviewItemViewModel, addedTagViewModel) => {
      this.removeTag(reviewItemViewModel, addedTagViewModel);
    });

    //Item changed event handler
    var itemChangedEvent = (wkItemData) => {
      var reviewItem = this.reviewItemService.getReviewItem(wkItemData.itemType, wkItemData.itemName).then((reviewItemViewModel) => {
        this.tagView.loadTagsToUi(reviewItemViewModel);
      });
    }

    this.tagView.bindReviewItemChanged(itemChangedEvent);

    // Load tag data to page
    this.loadTags();
  }

  async loadTags() {
    var currentItem = this.tagView.getCurrentWkItemData();
    var itemName = currentItem.itemName;
    var itemType = currentItem.itemType;

    var existingReviewItemViewModel = await this.reviewItemService.getReviewItem(itemType, itemName);
    if (existingReviewItemViewModel == null) {
      existingReviewItemViewModel = await this.reviewItemService.createNewReviewItem(itemType, itemName);
    }

    this.tagView.loadReviewItem(existingReviewItemViewModel);
  }

  addTag(reviewItemViewModel, addedTagViewModel) {
    //TODO Sanitize html
    this.reviewItemService.addTagToReviewItem(reviewItemViewModel, addedTagViewModel).then((updatedReviewItemViewModel) => {
      this.tagView.loadReviewItem(updatedReviewItemViewModel);
    });
  }

  removeTag(reviewItemViewModel, removedTagViewModel) {
    this.reviewItemService.removeTagFromReviewItem(reviewItemViewModel, removedTagViewModel).then((updatedReviewItemViewModel) => {
      this.tagView.loadReviewItem(updatedReviewItemViewModel);
    });
  }
}

/**
 * Creates a tagger UI based on the page
 * that the script is current on
 */
class TaggerUiFactory {
  static createTaggerUi() {
    //Add UI (depending on page)
    var pageUrl = window.location.href;
    if (pageUrl.indexOf('wanikani.com/review/session') >= 0) {
      // Review
      return new ReviewTaggerView();
    } else if (pageUrl.indexOf('wanikani.com/lesson/session') >= 0) {
      // Lesson
      throw new Error('Lesson page not yet supported');
      return new LessonTaggerView();
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