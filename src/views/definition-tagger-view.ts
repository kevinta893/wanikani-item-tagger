/**
 * UI for the definition pages on Wanikani
 * For radicals, kanji, and vocabulary pages
 */
class DefinitionTaggerView implements TagView {

  private readonly html = `
    <div class="alternative-meaning">
      <h2>Tags</h2>
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
    var rootElement = $('#information');
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

  getCurrentWkItemData(): WanikaniItemDataModel {
    // Fetches item data off the current page
    // Gathers data from page
    var url = new URL(window.location.href);
    var pageUrlPathParts = url.pathname.split('/');
    var itemType = ItemTypeMapper.mapUrlItemTypeToItemType(pageUrlPathParts[1]);
    var itemName = decodeURIComponent(pageUrlPathParts[2]);

    var wkItemData = new WanikaniItemDataModel();

    wkItemData.itemName = itemName;
    wkItemData.itemType = itemType;

    return wkItemData;
  }

  getReviewItem(): ReviewItemViewModel {
    return this.reviewItem;
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