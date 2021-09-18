class NullTaggerView implements TagView {

  /**
   * Used on pages that do not need to have 
   * the tagger
   */
  getReviewItem(): ReviewItemViewModel {
    return null;
  }
  loadTagEditorOptions(selectableTags: TagViewModel[]): void {

  }
  addTagEditorTagOption(tagOption: TagViewModel): void {

  }
  loadReviewItem(reviewItem: ReviewItemViewModel): void {

  }
  getCurrentWkItemData(): WanikaniItemDataModel {
    return null;
  }
  bindReviewItemChanged(handler: (wkItemData: WanikaniItemDataModel) => void): void {

  }
  bindTagDeleted(handler: (deletedTag: TagViewModel) => void): void {

  }
  bindTagUpdated(handler: (updatedTag: TagViewModel) => void): void {

  }
  bindNewTagCreated(handler: (newTag: TagViewModel) => void): void {

  }
  bindTagRemoved(handler: (reviewItem: ReviewItemViewModel, addedTag: TagViewModel) => void): void {

  }
  bindTagAdded(handler: (reviewItem: ReviewItemViewModel, addedTag: TagViewModel) => void): void {

  }
}