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
    // Clean tag text
    addedTagViewModel.tagText = addedTagViewModel.tagText.trim();

    // Validate the entered tag text
    var tagText = addedTagViewModel.tagText;
    var isValidTagText = TagValidator.isValid(tagText);
    if (!isValidTagText){
      console.warn(`Attempted to add invalid tag text: ${tagText}`);
      return;
    }

    // Valid tag
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