/**
 * Tagger UI for the review page
 */
class ReviewTaggerView {

  rootElement;
  html = `
    <div class="tag-ui">
      <h2 class="tag-ui-h2">Tags</h2>
      <div>
        <div id="tag-list"></div>
        <button id="tag-ui-open-tag-input-btn" class="tag-ui-add-btn" title="Add your own tags" style="display: inline-block;">+</button>
      <div id="tag-ui-add-tag-form-root" style="display: none;">
        <input id="tag-ui-tag-input" type="text" autocaptialize="none" autocomplete="on" spellcheck="off" autocorrect="false">
        <button id="tag-ui-add-tag-btn" class="user-tag-add-btn">+</button>
      </div>
    </div>
    `;
  css = `
    .tag-ui-h2{
      text-align: left;
    }
    .tag-ui{
      position: absolute;
      top: 75px;
      right: 20px;
      padding: 0px 5px 2px;
      -webkit-border-radius: 3px;
      -moz-border-radius: 3px;
      border-radius: 3px;
      z-index: 99;
      opacity: 0.8;
      background-color: darkgray;
    }
    .tag-ui-add-btn{
      display: inline-block;
    }
    .tag {
      cursor: pointer;
      display: inline-block;
      padding-left: 0.5em;
      padding-right: 0.5em;
      margin-right: 0.5em;
      margin-bottom: 0.5em;
      background-color: #AA00FF;
      color: #eee;
      -webkit-border-radius: 3px;
      -moz-border-radius: 3px;
      border-radius: 3px;
    }
    `;
  tagListElem;

  constructor() {
    GM_addStyle(this.css);

    //Add UI to meaning section of a Lesson (before quiz)
    var rootElement = $('#question');
    rootElement.append(this.html);

    var tagList = $('#tag-list');
    var tagInput = $('#tag-ui-tag-input');

    //Input tag button When clicked, opens up a textbox for tag entry
    var tagInputButton = $('#tag-ui-open-tag-input-btn');
    var addTagFormRoot = $('#tag-ui-add-tag-form-root')
    tagInputButton.on('click', () => {
      tagInputButton.hide();
      addTagFormRoot.show();
      tagInput.val('');

      tagInput.focus();
    });

    //When new tag is submitted
    var tagEnteredCallback = () => {
      var newTagText = tagInput.val();
      //TODO!!!! sanitize(newTagText);
      tagInput.val('');
      addTagFormRoot.hide();
      tagInputButton.show();

      var newItemModel = new TagViewModel();
      newItemModel.tagText = newTagText;

      this.addTag(newItemModel);

      //Trigger event callbacks
      this.triggerTagAddEvent(newItemModel);
    };

    //Button to confirm button when tag entry is complete
    var addTagButton = $('#tag-ui-add-tag-btn');
    addTagButton.on('click', tagEnteredCallback);
    tagInput.on('keypress', function (e) {
      if (e.which == 13) {
        tagEnteredCallback();
      }
    });

    this.tagListElem = tagList;
    this.rootElement = rootElement;
  }

  loadTagsToUi(tagList) {
    this.tagListElem.find('.tag').remove();

    tagList.forEach(tag => {
      this.addTag(tag);
    });
  }

  addTag(tagViewModel) {
    var newTag = $('<li></li>');
    //TODO Sanitize html
    newTag.addClass('tag');
    newTag.attr('title', 'Click to remove tag');
    newTag.attr('value', tagViewModel.tagText);
    newTag.data('view-model', tagViewModel);
    newTag.text(tagViewModel.tagText);
    newTag.on('click', () => {
      this.removeTag(tagViewModel);
      this.triggerTagRemoveEvent(tagViewModel);
    });

    this.tagListElem.append(newTag);
  }

  removeTag(tagViewModel) {
    this.tagListElem.find(`.tag[value="${tagViewModel.tagText}"]`).get(0).remove();
  }

  getCurrentTags() {
    var currentTags = this.tagListElem.find('.tag')
      .map((i, tagElem) => $(tagElem).data('view-model'));
    return Array.from(currentTags);
  }

  getCurrentWkItemData() {
    // TODO Move this to a "data provider" kind of class
    // For fetching raw data off the current page
    //Gather data from page
    var currentItem = $.jStorage.get("currentItem");

    var wkItemData = new WanikaniItemDataModel();

    //Determine item type
    var itemType = '';
    var itemName = '';
    if (currentItem.hasOwnProperty('voc')) {
      itemType = ItemTypes.Vocabulary;
      itemName = currentItem.voc;
    }
    else if (currentItem.hasOwnProperty('kan')) {
      itemType = ItemTypes.Kanji;
      itemName = currentItem.kan;
    }
    else if (currentItem.hasOwnProperty('rad')) {
      itemType = ItemTypes.Radical;
      itemName = currentItem.rad;
    }

    wkItemData.itemName = itemName;
    wkItemData.itemType = itemType;

    return wkItemData;
  }
}