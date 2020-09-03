/**
 * Tagger UI for the review page
 */
class ReviewTaggerView implements TagView {

  private readonly html = `
    <div id="tag-ui-review">
      <div class="tag-ui-title">Tags</div>
      <div id="tag-list"></div>
      <button id="tag-ui-open-editor-btn" class="tag-ui-add-btn" title="Edit Tags">Edit tags</button>
    </div>
  `;

  private tagListView: TagListView;
  private tagEditorView: TagEditorView;

  private reviewItem: ReviewItemViewModel;

  private readonly eventTagAdded = new EventEmitter();
  private readonly eventTagRemoved = new EventEmitter();
  private readonly eventTagReviewItemChanged = new EventEmitter();

  constructor() {
    //Configure the UI for the definition page
    var rootElement = $('body');
    var tagContainer = rootElement.append(this.html);

    //Form containing tag input ui
    var addTagFormRoot = $('#tag-ui-input-form');
    addTagFormRoot.hide();

    //Button that opens up the input ui
    var openTagEditorButton = $('#tag-ui-open-editor-btn')

    var addTagButton = $('#tag-ui-input-submit');
    addTagButton.prop('disabled', true);

    this.tagListView = new TagListView('#tag-list');

    $('body').append('<div id="tag-editor"></div>')
    this.tagEditorView = new TagEditorView('#tag-editor');
    this.tagEditorView.hide();
    this.tagEditorView.bindTagSelectionChanged((tagViewModel, isSelected) => {
      this.tagSelectionChanged(tagViewModel, isSelected);
    });

    //Open up input UI when add tag button clicked
    openTagEditorButton.on('click', (e) => {
      var position = openTagEditorButton.position();
      var buttonHeight = openTagEditorButton.outerHeight();
      var xPos = position.left;
      var yPos = position.top + buttonHeight;
      this.tagEditorView.toggleEditorView(xPos, yPos);
    });

    //Review item changed event
    var itemChangedHandler = (key) => {
      var rawWanikaniItem = this.getCurrentReviewItem();
      if (rawWanikaniItem == null) {
        // Sometimes the review item is not ready
        return;
      }

      var wanikaniItem = this.convertCurrentReviewItem(rawWanikaniItem);
      this.eventTagReviewItemChanged.emit(wanikaniItem);
    };
    $.jStorage.listenKeyChange('currentItem', itemChangedHandler);
  }

  private getCurrentReviewItem(): any {
    return $.jStorage.get('currentItem');
  }

  private convertCurrentReviewItem(currentReviewItem: any): WanikaniItemDataModel {
    var wkItemData = new WanikaniItemDataModel();

    //Determine item type
    var itemType: ReviewItemType;
    var itemName: string;
    if (currentReviewItem.hasOwnProperty('voc')) {
      itemType = ReviewItemType.Vocabulary;
      itemName = currentReviewItem.voc;
    }
    else if (currentReviewItem.hasOwnProperty('kan')) {
      itemType = ReviewItemType.Kanji;
      itemName = currentReviewItem.kan;
    }
    else if (currentReviewItem.hasOwnProperty('rad')) {
      itemType = ReviewItemType.Radical;
      itemName = currentReviewItem.rad;
    }

    wkItemData.itemName = itemName;
    wkItemData.itemType = itemType;

    return wkItemData;
  }

  getCurrentWkItemData(): WanikaniItemDataModel {
    var currentItem = this.getCurrentReviewItem()
    return this.convertCurrentReviewItem(currentItem);
  }

  tagSelectionChanged(selectedTag: TagViewModel, isSelected: boolean): void {
    var reviewItem = this.reviewItem;

    //Add or remove tags if they exist
    if (isSelected) {
      this.eventTagAdded.emit(reviewItem, selectedTag);
    } else {
      this.eventTagRemoved.emit(reviewItem, selectedTag);
    }
  }

  getReviewItem(): ReviewItemViewModel {
    return this.reviewItem;
  }

  loadReviewItem(reviewItem: ReviewItemViewModel): void {
    this.reviewItem = reviewItem;

    this.tagListView.loadReviewItem(reviewItem);
    this.tagEditorView.loadReviewItemSelection(reviewItem);
  }

  loadTagEditorOptions(listOfTags: Array<TagViewModel>): void {
    this.tagEditorView.loadTagOptions(listOfTags);
  }

  addTagEditorTagOption(tagOption: TagViewModel): void {
    this.tagEditorView.addTagPickOption(tagOption);
  }

  bindTagAdded(handler: (reviewItem: ReviewItemViewModel, addedTag: TagViewModel) => void): void {
    this.eventTagAdded.addEventListener(handler);
  }

  bindTagRemoved(handler: (reviewItem: ReviewItemViewModel, removedTag: TagViewModel) => void): void {
    this.eventTagRemoved.addEventListener(handler);
  }

  bindReviewItemChanged(handler: (wkItemData: WanikaniItemDataModel) => void): void {
    this.eventTagReviewItemChanged.addEventListener(handler);
  }

  bindNewTagCreated(handler: (newTag: TagViewModel) => void): void {
    this.tagEditorView.bindNewTagCreated(handler);
  }

  bindTagDeleted(handler: (deletedTag: TagViewModel) => void): void {
    this.tagEditorView.bindTagDeleted(handler);
  }

  bindTagUpdated(handler: (updatedTag: TagViewModel) => void): void {
    this.tagEditorView.bindTagUpdated(handler);
  }
}