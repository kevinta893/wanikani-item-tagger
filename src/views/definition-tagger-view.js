/**
 * UI for the definition pages on Wanikani
 * For radicals, kanji, and vocabulary pages
 */
class DefinitionTaggerView {

  html = `
      <div class="alternative-meaning">
        <h2>Tags</h2>
        <ul>
            <li id="tag-ui-open-input-btn" class="tag-ui-add-btn" title="Add your own tags" style="display: inline-block;"></li>
            <li id="tag-ui-input-form" style="display: none;"> 
              <div id="tag-editor"></div>
              <div id="tag-list-selected"></div>
              <div id="tag-recent-list"></div>
            </li>
        </ul>
      </div>
    `;
  newTagHtml = `
      <li class="tag"></li>
    `;
  rootElement;
  tagListElem;
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
    var tagInputButton = $('#tag-ui-open-input-btn')

    var addTagButton = $('#tag-ui-input-submit');
    addTagButton.prop('disabled', true);

    //Open up input UI when add tag button clicked
    tagInputButton.on('click', () => {
      tagInputButton.hide();
      addTagFormRoot.show();
    });

    this.tagListElem = tagContainer;
    this.rootElement = rootElement;

    this.tagEditor = new TagEditorView('#tag-editor');
    this.tagEditor.bindTagSelectionChanged((tagViewModel, isSelected) => {
      this.tagSelectionChanged(tagViewModel, isSelected);
    });
  }

  tagSelectionChanged(tagViewModel, isSelected){
    var reviewItemViewModel = this.getCurrentReviewItemViewModel();
    var haveTag = this.hasTag(tagViewModel.tagId);

    //Add or remove tags if they exist
    if (isSelected) {
      if (!haveTag) {
        this.addTag(tagViewModel);
        this.eventTagAdded.emit(reviewItemViewModel, tagViewModel);
      }
    } else {
      if (haveTag) {
        this.removeTag(tagViewModel);
        this.eventTagRemoved.emit(reviewItemViewModel, tagViewModel);
      }
    }
  }

  loadReviewItem(reviewItemViewModel) {
    this.reviewItemViewModel = reviewItemViewModel;

    this.tagListElem.find('.tag').remove();

    reviewItemViewModel.tags.forEach(tagViewModel => {
      this.addTag(tagViewModel);
      this.tagEditor.setTagSelection(tagViewModel.tagId, true);
    });
  }

  loadTagEditorOptions(listOfTagViewModels) {
    this.tagEditor.loadTagOptions(listOfTagViewModels);
  }

  addTag(tagViewModel) {
    var newTag = $(this.newTagHtml);
    newTag.attr('data-tag-id', tagViewModel.tagId);
    newTag.css('background-color', tagViewModel.tagColor);
    newTag.data('tag-view-model', tagViewModel);
    newTag.text(tagViewModel.tagText);

    this.tagListElem.find('li.tag-ui-add-btn').before(newTag);
  }

  removeTag(tagViewModel) {
    this.tagListElem.find(`.tag[data-tag-id="${tagViewModel.tagId}"]`).get(0).remove();
  }

  hasTag(tagId) {
    return this.tagListElem.find(`.tag[data-tag-id="${tagId}"]`).length > 0;
  }

  getCurrentTags() {
    var currentTags = this.tagListElem.find('.tag')
      .map((i, tagElem) => $(tagElem).data('tag-view-model'));
    return Array.from(currentTags);
  }

  getCurrentReviewItemViewModel() {
    var tags = this.getCurrentTags();
    this.reviewItemViewModel.tags = tags;

    return this.reviewItemViewModel;
  }

  getCurrentTags() {
    var currentTags = this.tagListElem.find('.tag')
      .map((i, tagElem) => $(tagElem).data('tag-view-model'));
    return Array.from(currentTags);
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

  bindTagAdded(handler) {
    this.eventTagAdded.addEventListener(handler);
  }

  bindTagRemoved(handler) {
    this.eventTagRemoved.addEventListener(handler);
  }

  bindReviewItemChanged(handler) {
    this.eventTagReviewItemChanged.addEventListener(handler);
  }
}