class TaggerController {
  private readonly reviewItemService: ReviewItemService;
  private readonly tagView: TagView;

  constructor(tagView: TagView, reviewItemService: ReviewItemService) {
    this.reviewItemService = reviewItemService;
    this.tagView = tagView;

    //Listen to tag add or remove events, save updated tags
    this.tagView.bindTagAdded((reviewItem, addedTag) => {
      this.addTag(reviewItem, addedTag);
    });

    this.tagView.bindTagRemoved((reviewItem, addedTag) => {
      this.removeTag(reviewItem, addedTag);
    });

    this.tagView.bindNewTagCreated((newTag) => {
      this.addNewTag(newTag);
    });

    this.tagView.bindTagUpdated((updatedTag) => {
      this.updateTag(updatedTag);
    });

    this.tagView.bindTagDeleted((removedTag) => {
      this.deleteTag(removedTag);
    });

    //Item changed event handler
    this.tagView.bindReviewItemChanged((wkItemData) => {
      this.reviewItemService.getReviewItem(wkItemData.itemType, wkItemData.itemName).then((reviewItemViewModel) => {
        this.tagView.loadReviewItem(reviewItemViewModel);
      });
    });

    // Load tag data to page
    this.loadTags();
    this.loadCurrentReviewItem();
  }

  async loadCurrentReviewItem(): Promise<void> {
    var currentItem = this.tagView.getCurrentWkItemData();
    var itemName = currentItem.itemName;
    var itemType = currentItem.itemType;

    var existingReviewItemViewModel = await this.reviewItemService.getReviewItem(itemType, itemName);
    if (existingReviewItemViewModel == null) {
      existingReviewItemViewModel = await this.reviewItemService.createNewReviewItem(itemType, itemName);
    }

    this.tagView.loadReviewItem(existingReviewItemViewModel);
  }

  async loadTags(): Promise<void> {
    var selectableTags = await this.reviewItemService.getAllSelectableTags();
    this.tagView.loadTagEditorOptions(selectableTags);
  }

  addTag(reviewItem: ReviewItemViewModel, addedTag: TagViewModel): void {
    // Clean tag text
    addedTag.tagText = addedTag.tagText.trim();

    // Validate the entered tag text
    var tagText = addedTag.tagText;
    var isValidTagText = TagValidator.isValid(tagText);
    if (!isValidTagText) {
      console.warn(`Attempted to add invalid tag text: ${tagText}`);
      return;
    }

    // Valid tag
    this.reviewItemService.addTagToReviewItem(reviewItem, addedTag).then((updatedReviewItem) => {
      this.tagView.loadReviewItem(updatedReviewItem);
    });
  }

  removeTag(reviewItem: ReviewItemViewModel, removedTag: TagViewModel): void {
    this.reviewItemService.removeTagFromReviewItem(reviewItem, removedTag).then((updatedReviewItem) => {
      this.tagView.loadReviewItem(updatedReviewItem);
    });
  }

  updateTag(updatedTag: TagViewModel): void {
    this.reviewItemService.updateTag(updatedTag).then(() => {
      this.loadTags();
      this.loadCurrentReviewItem();
    });
  }

  deleteTag(removedTag: TagViewModel): void {
    this.reviewItemService.deleteTag(removedTag).then(() => {
      this.loadTags();
      this.loadCurrentReviewItem();
    });
  }

  addNewTag(newTag: TagViewModel): void {
    this.reviewItemService.addNewTag(newTag).then((newlyAddedTag) => {
      this.tagView.addTagEditorTagOption(newlyAddedTag);
      var reviewItem = this.tagView.getReviewItem();
      this.addTag(reviewItem, newlyAddedTag);
    });
  }
}