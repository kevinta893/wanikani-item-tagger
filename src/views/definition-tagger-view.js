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
              <input id="tag-ui-input" type="text" autocaptialize="none" autocomplete="on" spellcheck="off" autocorrect="false" maxlength="${Constants.MAX_TAG_TEXT_LENGTH}">
              <div id="tag-color-picker"></div>
              <button id="tag-ui-input-submit" class="tag-ui-add-btn"></button>
  
              <div id="tag-list-selected"></div>
              <div id="tag-recent-list"></div>
            </li>
        </ul>
      </div>
    `;
  newTagHtml = `
      <li class="tag" title="Click to remove tag"></li>
    `;
  css = `
      .tag{
        cursor: pointer;
        display: inline-block;
        padding-left: 0.5em;
        padding-right: 0.5em;
        margin-right: 0.5em;
        margin-bottom: 0.5em;
        color: #eee;
        -webkit-border-radius: 3px;
        -moz-border-radius: 3px;
        border-radius: 3px;
      }
      .tag:hover{
  
      }
      .tag-ui-add-btn {
        cursor: pointer;
        margin-left: 0.3em;
      }
      .tag-ui-add-btn:before {
        content: '+ ADD TAG';
        margin-right: 0.5em;
        padding: 0.15em 0.3em;
        background-color: #999;
        color: #eee;
        -webkit-transition: background-color 0.3s linear;
        -moz-transition: background-color 0.3s linear;
        -o-transition: background-color 0.3s linear;
        transition: background-color 0.3s linear;
        -webkit-border-radius: 3px;
        -moz-border-radius: 3px;
        border-radius: 3px;
      }
    `;
  rootElement;
  tagListElem;
  colorPicker;
  reviewItemViewModel;

  eventTagAdded = new EventEmitter();
  eventTagRemoved = new EventEmitter();
  eventTagReviewItemChanged = new EventEmitter();

  constructor() {
    //Add CSS
    GM_addStyle(this.css);

    //Configure the UI for the definition page
    var rootElement = $('#information');
    var tagContainer = rootElement.append(this.html);

    //Form containing tag input ui
    var addTagFormRoot = $('#tag-ui-input-form');
    addTagFormRoot.hide();

    //Button that opens up the input ui
    var tagInputButton = $('#tag-ui-open-input-btn')

    //Tag input
    var tagInput = $('#tag-ui-input');

    var addTagButton = $('#tag-ui-input-submit');
    addTagButton.prop('disabled', true);

    this.colorPicker = new TagColorPickerView('#tag-color-picker');

    //Open up input UI when add tag button clicked
    tagInputButton.on('click', () => {
      tagInputButton.hide();
      addTagFormRoot.show();
      tagInput.val('');

      tagInput.focus();
    });

    //Disable tag enter button when text empty
    tagInput.on('keyup', function (e) {
      var inputText = tagInput.val();
      if (inputText.length <= 0) {
        addTagButton.prop('disabled', true);
      } else {
        addTagButton.prop('disabled', false);
      }
    });

    //When new tag is submitted
    var tagEnteredCallback = () => {
      var newTagText = tagInput.val();
      tagInput.val('');
      addTagButton.prop('disabled', true);
      addTagFormRoot.hide();
      tagInputButton.show();

      var newItemModel = new TagViewModel();
      newItemModel.tagText = newTagText;
      newItemModel.tagColor = this.colorPicker.getSelectedColor();

      //Trigger event callbacks
      var reviewItemViewModel = this.getCurrentReviewItemViewModel();
      this.eventTagAdded.emit(reviewItemViewModel, newItemModel);
    };

    //Enter button used to submit
    addTagButton.on('click', tagEnteredCallback);
    tagInput.on('keyup', function (e) {
      var inputText = tagInput.val();
      if (e.which == 13 && inputText.length > 0) {
        tagEnteredCallback();
      }
    });

    this.tagListElem = tagContainer;
    this.rootElement = rootElement;

    this.eventTagReviewItemChanged.emit(this.getCurrentWkItemData());
  }

  loadReviewItem(reviewItemViewModel) {
    this.reviewItemViewModel = reviewItemViewModel;

    this.tagListElem.find('.tag').remove();

    reviewItemViewModel.tags.forEach(tagViewModel => {
      this.addTag(tagViewModel);
    });
  }

  addTag(tagViewModel) {
    var newTag = $(this.newTagHtml);
    newTag.attr('data-tag-id', tagViewModel.tagId);
    newTag.css('background-color', tagViewModel.tagColor);
    newTag.data('tag-view-model', tagViewModel);
    newTag.text(tagViewModel.tagText);
    newTag.on('click', () => {
      this.removeTag(tagViewModel);
      var reviewItemViewModel = this.getCurrentReviewItemViewModel();
      this.eventTagRemoved.emit(reviewItemViewModel, tagViewModel);
    });

    this.tagListElem.find('li.tag-ui-add-btn').before(newTag);
  }

  removeTag(tagViewModel) {
    this.tagListElem.find(`.tag[data-tag-id="${tagViewModel.tagId}"]`).get(0).remove();
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