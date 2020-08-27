/**
 * UI for the definition pages on Wanikani
 * For radicals, kanji, and vocabulary pages
 */
class DefinitionTaggerView {

  html = `
    <div class="alternative-meaning">
      <h2>Tags</h2>
      <div id="tag-list"></div>
      <button id="tag-ui-open-editor-btn" class="tag-ui-add-btn" title="Edit Tags">Edit tags</button>
    </div>
  `;
  rootElement;
  tagListView;
  tagEditorView;

  reviewItemViewModel;

  eventTagAdded = new EventEmitter();
  eventTagRemoved = new EventEmitter();
  eventTagReviewItemChanged = new EventEmitter();

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
    this.rootElement = rootElement;

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

  tagSelectionChanged(tagViewModel, isSelected) {
    var reviewItemViewModel = this.reviewItemViewModel;

    //Add or remove tags if they exist
    if (isSelected) {
      this.eventTagAdded.emit(reviewItemViewModel, tagViewModel);
    } else {
      this.eventTagRemoved.emit(reviewItemViewModel, tagViewModel);
    }
  }

  loadReviewItem(reviewItemViewModel) {
    this.reviewItemViewModel = reviewItemViewModel;

    this.tagListView.loadReviewItem(reviewItemViewModel);
    this.tagEditorView.loadReviewItemSelection(reviewItemViewModel);
  }

  loadTagEditorOptions(listOfTagViewModels) {
    this.tagEditorView.loadTagOptions(listOfTagViewModels);
  }

  addTagEditorTagOption(tagViewModel) {
    this.tagEditorView.addTagPickOption(tagViewModel);
  }

  getCurrentWkItemData() {
    // Fetches item data off the current page
    // Gathers data from page
    var url = new URL(window.location.href);
    var pageUrlPathParts = url.pathname.split('/');
    var itemType = mapUrlItemTypeToItemType(pageUrlPathParts[1]);
    var itemName = decodeURIComponent(pageUrlPathParts[2]);

    var wkItemData = new WanikaniItemDataModel();

    wkItemData.itemName = itemName;
    wkItemData.itemType = itemType;

    return wkItemData;
  }

  getReviewItem() {
    return this.reviewItemViewModel;
  }

  bindTagAdded(handler) {
    this.eventTagAdded.addEventListener(handler);
  }

  bindTagRemoved(handler) {
    this.eventTagRemoved.addEventListener(handler);
  }

  bindReviewItemChanged(handler) {
    this.eventTagReviewItemChanged.addEventListener(handler);
  }

  bindNewTagCreated(handler) {
    this.tagEditorView.bindNewTagCreated(handler);
  }

  bindTagDeleted(handler) {
    this.tagEditorView.bindTagDeleted(handler);
  }

  bindTagUpdated(handler) {
    this.tagEditorView.bindTagUpdated(handler);
  }
}