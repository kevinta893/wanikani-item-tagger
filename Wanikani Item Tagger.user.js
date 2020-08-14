// ==UserScript==
// @name        Wanikani Item Tagger
// @namespace   kevinta893
// @author      kevinta893
// @description Allows you to tag, classify, and organize review items in WaniKani
// @run-at      document-end
// @include     https://www.wanikani.com/review/session
// @include     https://www.wanikani.com/lesson/session
// @include     https://www.wanikani.com/radicals/*
// @include     https://www.wanikani.com/kanji/*
// @include     https://www.wanikani.com/vocabulary/*
// @version     0.0.1
// @run-at      document-end
// @grant       GM.setValue
// @grant       GM.getValue
// @grant       GM.listValues
// @grant       GM_addStyle
// @resource    pickr_monolith_style https://cdn.jsdelivr.net/npm/@simonwep/pickr@1.7.2/dist/themes/monolith.min.css
// @require     https://cdn.jsdelivr.net/npm/@simonwep/pickr@1.7.2/dist/pickr.min.js
// @homepage    https://github.com/kevinta893/wanikani-common-vocab-indicator
// @homepageURL https://github.com/kevinta893/wanikani-common-vocab-indicator
// @updateURL   https://github.com/kevinta893/wanikani-item-tagger/raw/master/Wanikani%20Item%20Tagger.user.js
// ==/UserScript==


//Loads user script
function initialize() {
  // External Styles
  var pickrMonolithCSS = GM_getResourceText("pickr_monolith_style");
  GM_addStyle(pickrMonolithCSS);

  // Data services
  var dataContext = new TamperMonkeyUserDataContext();
  var reviewItemRepository = new ReviewItemRepository(dataContext);
  var tagRepository = new TagRepository(dataContext);
  var tagService = new ReviewItemService(reviewItemRepository, tagRepository);

  // UI
  var tagView = TaggerUiFactory.createTaggerUi();
  var taggerController = new TaggerController(tagView, tagService);

  // Config UI
  var taggerConfigView = new TaggerConfigView();
  var taggerConfigController = new TaggerConfigController(taggerConfigView, tagService);

  //tagConfigView.onConfigOpen();
  console.log('Wanikani Item Tagger started.');
}

//===================================================
//Configuration page

class TaggerConfigView {

  html = `
  <span id="tag-ui-open-config-btn">&#x2699;</span>
  
  <div id="tag-ui-config-modal">
    <div id="tag-ui-config-modal-content">
      <span id="tag-ui-close-config-btn">&times;</span>
      <h2>Tag statistics</h2>
      <p>
        Tagged Items <span id="tag-ui-tagged-item-count" class="tag-ui-stat-value"></span>
      </p>
      <p>
        Total Number of Tags <span id="tag-ui-tag-count" class="tag-ui-stat-value"></span>
      </p>
      <button id="tag-ui-config-export-csv">Export All Tags to CSV</button>
    </div>
    <div id="tag-ui-modal-background"></div>
  </div>
  `;
  css = `
  #tag-ui-config-modal {
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
  #tag-ui-modal-background{
    display: block;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0,0,0);
    background-color: rgba(0,0,0,0.4);
    z-index: -1;
    cursor: pointer;
  }
  #tag-ui-config-modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    z-index: 1;
    width: 80%;
  }
  
  #tag-ui-close-config-btn {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
  }
  
  #tag-ui-close-config-btn:hover,
  #tag-ui-close-config-btn:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }

  .tag-ui-stat-value{
    font-weight: bold;
  }
  `;
  configModal;

  listenersConfigModalOpened = [];
  listenersConfigModalClosed = [];
  listenersConfigCSVExportRequested = [];

  constructor() {
    $('body').append(this.html);
    GM_addStyle(this.css);

    // Get the modal
    var configModal = $('#tag-ui-config-modal');
    this.configModal = configModal;

    var openConfigBtn = $('#tag-ui-open-config-btn');
    openConfigBtn.on('click', () => {
      this.onConfigOpen();
    });

    var closeBtn = $("#tag-ui-close-config-btn");
    closeBtn.on('click', () => {
      this.onConfigClose();
    });

    // Click outside modal, close
    var modalBackgroundOverlay = $('#tag-ui-modal-background');
    modalBackgroundOverlay.on('click', () => {
      this.onConfigClose();
    });

    // CSV export button
    var csvExportBtn = $('tag-ui-config-export-csv');
    csvExportBtn.on('click', () => {
      this.exportCsv();
    });
  }

  /**
   * Shows the config modal popup
   */
  showConfigModal() {
    this.configModal.show();
  }

  /**
   * Hides the config modal popup
   */
  closeConfigModal() {
    this.configModal.hide();
  }

  /**
   * Adds user stats to the config page
   */
  showUserStats(statsModel) {
    var taggedItemCountLabel = $('#tag-ui-tagged-item-count');
    var tagCountLabel = $('#tag-ui-tag-count');

    taggedItemCountLabel.text(statsModel.TaggedItemCount);
    tagCountLabel.text(statsModel.TotalTagCount);
  }

  /**
   * Loads data to the config modal
   */
  onConfigOpen() {
    //Emit event
    this.listenersConfigModalOpened.forEach(handler => {
      handler();
    });
  }

  /**
   * Config modal is closed
   */
  onConfigClose() {
    //Emit event
    this.listenersConfigModalClosed.forEach(handler => {
      handler();
    });
  }

  /**
   * Starts the csv export process
   */
  exportCsv() {
    //Emit event
    this.listenersConfigModalClosed.forEach(handler => {
      handler();
    });
  }

  bindOnConfigOpen(handler) {
    this.listenersConfigModalOpened.push(handler);
  }

  bindOnConfigClose(handler) {
    this.listenersConfigModalClosed.push(handler);
  }

  bindOnConfigCSVExportRequested(handler) {
    this.listenersConfigCSVExportRequested.push(handler);
  }
}

class TaggerConfigController {

  tagConfigView;
  tagService;

  constructor(tagConfigView, tagService) {
    this.tagConfigView = tagConfigView;
    this.tagService = tagService;

    this.tagConfigView.bindOnConfigOpen(() => {
      this.tagService.getUserStats().then((userStats) => {
        this.tagConfigView.showUserStats(userStats);
      });
      this.tagConfigView.showConfigModal();
    });

    this.tagConfigView.bindOnConfigClose(() => {
      this.tagConfigView.closeConfigModal();
    });

    this.tagConfigView.bindOnConfigCSVExportRequested(() => {

    });
  }
}

//===================================================
//Controller
//Handles business logic

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

/**
 * The tagger UI that handles displaying tags
 * to the user and accepting new tag input
 * Depending on the page (e.g. review, lesson, definition), 
 * this UI may have a different structure per page
 * When constructed, the subclasses of this UI should
 * self attach itself to the page.
 */
class BaseTaggerView {

  constructor() {

  }

  /**
   * Loads a list of tag strings to the UI
   * for display
   * @param {ReviewItemViewModel} tagList 
   */
  loadReviewItem(reviewItemViewModel) {
  }

  /**
   * Gets the current tag strings that are 
   * being displayed by the UI currently
   */
  getCurrentTags() {

  }

  /**
   * Gets the current WaniKani item data from the page
   */
  getCurrentWkItemData() {
  }
}

/**
 * Tagger UI for the lesson pages
 * These pages are unique in that the lesson and
 * the quiz are both in the same page.
 * The lesson itself also contains 3 different versions
 * of the information cards, which all need the tagger UI
 */
class LessonTaggerView extends BaseTaggerView {

  rootElement;
  css = ``;
  tagListElem;

  constructor() {
    super();

    //Add UI to meaning section of a Lesson (before quiz)
    var lessonVocabInformationSelector = '#supplement-voc-meaning > div > div.pure-u-1-4.col1';
    var lessonKanjiInformationSelector = '#supplement-kan-meaning > div > div.pure-u-1-4.col1';
    var lessonRadicalInformationSelector = '#supplement-rad-name > div > div';
    var quizInformationSelector = '#item-info-col1'
    var allSelectors = [
      lessonVocabInformationSelector,
      lessonKanjiInformationSelector,
      lessonRadicalInformationSelector,
      quizInformationSelector
    ];

    var rootElement = $(allSelectors.join(','));

    var tagSection = $('<div></div>');

    var tagSectionTitle = $('<h2></h2>');
    tagSectionTitle.text('Tags');

    var tagList = $('<div></div>');
    tagList.attr('id', 'tag-list');

    //Input tag button
    var tagInputButton = $('<button></button>')
    tagInputButton.addClass('user-tag-add-btn');
    tagInputButton.attr('title', 'Add your own tags');
    tagInputButton.attr('style', 'display: inline-block;');

    var addTagFormRoot = $('<div></div>');
    addTagFormRoot.attr('style', 'display: inline-block;');
    addTagFormRoot.hide();

    //Tag text input box
    var tagInput = $('<input></input>');
    tagInput.attr('type', 'text');
    tagInput.attr('autocaptialize', 'none');
    tagInput.attr('autocomplete', 'on');
    tagInput.attr('spellcheck', 'off');
    tagInput.attr('autocorrect', 'false');
    tagInput.addClass('noSwipe');
    tagInput.off();

    //Confirm button when tag entry is complete
    var addTagButton = $('<button></button>');
    addTagButton.addClass('user-tag-add-btn');

    addTagFormRoot.append(tagInput);
    addTagFormRoot.append(addTagButton);

    //Input tag button When clicked, opens up a textbox for tag entry
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

    addTagButton.on('click', tagEnteredCallback);
    tagInput.on('keypress', function (e) {
      if (e.which == 13) {
        tagEnteredCallback();
      }
    });

    var ulButtonParent = $('<div></div>');
    ulButtonParent.append(tagInputButton);
    ulButtonParent.append(addTagFormRoot);

    tagSection.append(tagSectionTitle);
    tagSection.append(tagList);
    tagSection.append(ulButtonParent);

    this.tagListElem = tagList;
    rootElement.append(tagSection);

    this.rootElement = rootElement;

    //Every time item changes, update the tag list
    $.jStorage.listenKeyChange('currentItem', itemChangedEvent);
    $.jStorage.listenKeyChange('l/currentLesson', itemChangedEvent);
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
    var pageUrl = window.location.href;
    var currentItem;
    if (pageUrl.indexOf('lesson') >= 0) {
      //In lesson section
      currentItem = $.jStorage.get('l/currentLesson');
    }
    else {
      //In quiz section 
      currentItem = $.jStorage.get('l/currentQuizItem');
    }

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

/**
 * Tagger UI for the review page
 */
class ReviewTaggerView extends BaseTaggerView {

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
    super();

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

/**
 * UI for the definition pages on Wanikani
 * For radicals, kanji, and vocabulary pages
 */
class DefinitionTaggerView extends BaseTaggerView {

  html = `
    <div class="alternative-meaning">
      <h2>Tags</h2>
      <ul>
          <li id="tag-ui-open-input-btn" class="tag-ui-add-btn" title="Add your own tags" style="display: inline-block;"></li>
          <li id="tag-ui-input-form" style="display: none;">
            <input id="tag-ui-input" type="text" autocaptialize="none" autocomplete="on" spellcheck="off" autocorrect="false" maxlength="100">
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
    super();

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

    this.colorPicker = new TagColorPickerView('#tag-color-picker');

    //Open up input UI when add tag button clicked
    tagInputButton.on('click', () => {
      tagInputButton.hide();
      addTagFormRoot.show();
      tagInput.val('');

      tagInput.focus();
    });

    //When new tag is submitted
    var tagEnteredCallback = () => {
      var newTagText = tagInput.val();
      tagInput.val('');
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
    tagInput.on('keypress', function (e) {
      if (e.which == 13) {
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
    newTag.attr('value', tagViewModel.tagText);
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
    this.tagListElem.find(`.tag[value="${tagViewModel.tagText}"]`).get(0).remove();
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

//===================================================
//Event Emitter
//C# style-ish event object

class EventEmitter {
  listeners = [];

  constructor() {
  }

  addEventListener(handler) {
    this.listeners.push(handler);
  }

  emit(eventData) {
    this.listeners.forEach(handler => {
      handler(eventData);
    });
  }

  emit(eventData1, eventData2) {
    this.listeners.forEach(handler => {
      handler(eventData1, eventData2);
    });
  }
}

//===================================================
//Color picker UI
//Uses pickr
//https://github.com/Simonwep/pickr

class TagColorPickerView {
  colorPicker;

  constructor(replaceElementSelector) {
    const defaultSwatch = [
      '#F15A5A',
      '#F0C419',
      '#4EBA6F',
      '#2D95BF',
      '#955BA5',
    ];
    this.colorPicker = Pickr.create({
      el: replaceElementSelector,
      theme: 'monolith',

      palette: true,
      swatches: defaultSwatch,
      default: defaultSwatch[4],

      components: {
        // Main components
        preview: true,
        opacity: false,
        hue: true,

        // Input / output Options
        interaction: {
          rgb: true,
          input: true,
          save: true
        }
      }
    });
  }

  getSelectedColor() {
    return this.colorPicker.getSelectedColor().toHEXA().toString();
  }
}

//===================================================
//Item types enum

const ItemTypes = {
  Vocabulary: 'Vocabulary',
  Kanji: 'Kanji',
  Radical: 'Radical'
};


/**
 * Converts definition page url item type to the ItemTypes enum
 * @param {string} urlItemType The item type based on the definition page URL
 */
function mapUrlItemTypeToItemType(urlItemType) {
  //TODO Refactor this into the definitions UI class since it is only used there.
  if (urlItemType.toLowerCase() == 'vocabulary') {
    return ItemTypes.Vocabulary;
  }
  else if (urlItemType.toLowerCase() == 'kanji') {
    return ItemTypes.Kanji;
  }
  else if (urlItemType.toLowerCase() == 'radicals') {
    return ItemTypes.Radical;
  }

  throw new Error(`Unknown item type=${urlItemType}`);
}

//===================================================
//View/Domain models

/**
 * An object model of the Wanikani item
 * Contains only data that can be extracted from WaniKani
 */
class WanikaniItemDataModel {
  itemName = '';
  itemType = '';
}

class ReviewItemStatisticsViewModel {
  taggedItemCount = 0;
  totalTagCount = 0;
}

/**
 * Represents data for 1 tag
 * Contains information on how to display the tag on the UI
 */
class TagViewModel {
  tagId = 0;
  tagText = '';
  tagColor = '';     //Hexadecimal color
}

class ReviewItemViewModel {
  itemId = '';
  itemType = '';
  itemName = '';

  tags = [];    //List of TagViewModel
}


/**
 * Mapping function that converts a wanikani item data object
 * and maps it to the review item view model
 * @param {WanikaniItemDataModel} wkItemModel A wanikani item data object representing the wanikani item on the page
 * @param {Array<TagViewModel>} currentTags (optional) An array/list of current user defined tags associated with the item, otherwise it is an empty list by default
 */
function mapToTaggerItem(wkItemModel, currentTags) {
  var taggerItem = new ReviewItemDTO();

  //Current tags is null, default to empty list
  if (currentTags == null) { currentTags = []; }

  //Map fields
  taggerItem.itemName = wkItemModel.itemName;
  taggerItem.itemType = wkItemModel.itemType;
  taggerItem.tags = currentTags;

  return taggerItem;
}


//===================================================
//Database models

class ReviewItemDTO {
  itemId = '';
  itemType = '';
  itemName = '';

  tagIds = [];    //a list of tag ids (integers)
}

class TagDTO {
  tagId = 0;
  tagText = '';
  tagColor = '';
}

function mapReviewItemViewModelToDTO(reviewItemViewModel) {
  var reviewItemDto = new ReviewItemDTO();
  reviewItemDto.itemId = reviewItemViewModel.itemId;
  reviewItemDto.itemType = reviewItemViewModel.itemType;
  reviewItemDto.itemName = reviewItemViewModel.itemName;
  reviewItemDto.tagIds = reviewItemViewModel.tags.map(tag => {
    return tag.tagId;
  });

  return reviewItemDto;
}

function mapReviewItemDTOToViewModel(reviewItemDto) {
  var reviewItemViewModel = new ReviewItemViewModel();
  reviewItemViewModel.itemId = reviewItemDto.itemId;
  reviewItemViewModel.itemType = reviewItemDto.itemType;
  reviewItemViewModel.itemName = reviewItemDto.itemName;
  reviewItemViewModel.tags = [];

  return reviewItemViewModel;
}

/**
 * Converts tag view model to Database model
 * @param {TagViewModel} tagViewModel 
 * @return {TagDTO}
 */
function mapTagViewModelToDTO(tagViewModel) {
  var tagDto = new TagDTO();
  tagDto.tagId = tagViewModel.tagId;
  tagDto.tagText = tagViewModel.tagText;
  tagDto.tagColor = tagViewModel.tagColor;

  return tagDto;
}

/**
 * Converts tag database model to view model
 * @param {TagViewModel} tagViewModel 
 * @return {TagDTO}
 */
function mapTagDTOToViewModel(tagDto) {
  var tagViewModel = new TagViewModel();
  tagViewModel.tagId = tagDto.tagId;
  tagViewModel.tagText = tagDto.tagText;
  tagViewModel.tagColor = tagDto.tagColor;

  return tagViewModel;
}

//===================================================
//Tag service

/**
 * Manages review item and tag data
 */
class ReviewItemService {
  reviewItemRepository;
  tagRepository;

  constructor(reviewItemRepository, tagRepository) {
    this.reviewItemRepository = reviewItemRepository;
    this.tagRepository = tagRepository;
  }

  async putReviewItem(reviewItemViewModel) {
    var reviewItemDto = mapReviewItemViewModelToDTO(reviewItemViewModel);
    var tagDtos = reviewItemViewModel.tags.map(tagViewModel => mapTagViewModelToDTO(tagViewModel));

    var putTagTasks = [];
    tagDtos.forEach(tagDto => {
      putTagTasks.push(this.tagRepository.putTag(tagDto));
    });

    await Promise.all(putTagTasks);

    var updatedReviewItem = await this.reviewItemRepository.putReviewItem(reviewItemDto);
    reviewItemViewModel.itemId = updatedReviewItem.itemId;

    return reviewItemViewModel;
  }

  /**
   * Creates a new review item and saves it
   * @param {string} itemType 
   * @param {string} itemName 
   */
  async createNewReviewItem(itemType, itemName) {
    // Does not exist create and save
    var newReviewItemDto = new ReviewItemDTO();
    newReviewItemDto.itemType = itemType;
    newReviewItemDto.itemName = itemName;
    newReviewItemDto.tagIds = [];

    var newlyPutReviewItemDTO = await this.reviewItemRepository.putReviewItem(newReviewItemDto);

    var reviewItemViewModel = mapReviewItemDTOToViewModel(newlyPutReviewItemDTO);
    return reviewItemViewModel;
  }

  async addTagToReviewItem(reviewItemViewModel, tagViewModel) {
    var tagToAddDto = mapTagViewModelToDTO(tagViewModel);

    // Add new tag to database if it does not exist already
    var existingTagDto = await this.tagRepository.getTagByText(tagViewModel.tagText);
    if (existingTagDto == null) {
      //Tag does not exist, need to add
      existingTagDto = await this.tagRepository.putTag(tagToAddDto);
    }

    var reviewItemDto = mapReviewItemViewModelToDTO(reviewItemViewModel);
    reviewItemDto.tagIds.push(existingTagDto.tagId);

    await this.reviewItemRepository.updateReviewItem(reviewItemDto);

    //Update review model and return
    var existingTagViewModel = mapTagDTOToViewModel(existingTagDto);
    reviewItemViewModel.tags.push(existingTagViewModel);
    return reviewItemViewModel;
  }

  async removeTagFromReviewItem(reviewItemViewModel, tagViewModel) {
    reviewItemViewModel.tags = reviewItemViewModel.tags.filter(tag => tag.tagText != tagViewModel.tagText);

    var reviewItemDto = mapReviewItemViewModelToDTO(reviewItemViewModel);
    await this.reviewItemRepository.updateReviewItem(reviewItemDto);

    return reviewItemViewModel;
  }

  async getReviewItem(itemType, itemName) {
    var reviewItemDto = await this.reviewItemRepository.getReviewItem(itemType, itemName);
    if (reviewItemDto == null) {
      return null;
    }

    var reviewItemViewModel = mapReviewItemDTOToViewModel(reviewItemDto);
    // Get tags if any
    if (reviewItemDto.tagIds.length >= 1) {
      var tagViewModelGetTasks = reviewItemDto.tagIds.map(tagId => {
        return this.tagRepository.getTag(tagId);
      });

      var tags = await Promise.all(tagViewModelGetTasks);
      reviewItemViewModel.tags = tags;
    }

    return reviewItemViewModel;
  }

  async getUserStats() {
    var allTaggedItems = await this.reviewItemRepository.getAllReviewItems();
    var allTags = [].concat.apply([], allTaggedItems.map(item => item.tags));

    var statsModel = new ReviewItemStatisticsViewModel();
    statsModel.taggedItemCount = allTaggedItems.filter(item => item.tags.length > 0).length;
    statsModel.totalTagCount = allTags.length;

    return statsModel;
  }
}


//===================================================
//Repositories

class ReviewItemRepository {
  reviewItemsNamespace = "review-items";
  dataContext;

  constructor(dataContext) {
    this.dataContext = dataContext;
  }

  async updateReviewItem(reviewItemDto) {
    if (this.isNullOrEmpty(reviewItemDto.itemId)) {
      throw new Error(`Review Item update failed, review item id is null. Review Item=${reviewItem}`);
    }

    var key = this.generateStorageKey(reviewItemDto.itemId);
    var reviewItem = await this.dataContext.get(key);

    if (reviewItem == null) {
      throw new Error(`Review Item update failed, review item does not exist. Review Item=${reviewItem}`);
    }

    await this.dataContext.put(key, reviewItemDto);
  }

  async putReviewItem(reviewItemDto) {
    if (!this.isNullOrEmpty(reviewItemDto.itemId)) {
      throw new Error(`Review Item put failed, item id must be null to insert object. Review Item=${reviewItem}`);
    }

    var reviewItemId = this.generateReviewItemId(reviewItemDto.itemType, reviewItemDto.itemName);
    var key = this.generateStorageKey(reviewItemId);

    var reviewItem = await this.dataContext.get(key);
    if (reviewItem != null) {
      throw new Error(`Review Item put failed, review item already exists. Review Item=${reviewItem}`);
    }

    reviewItemDto.itemId = reviewItemId;
    await this.dataContext.put(key, reviewItemDto);
    return reviewItemDto;
  }

  async getReviewItem(reviewItemType, reviewItemName) {
    var reviewItemId = this.generateReviewItemId(reviewItemType, reviewItemName);
    var key = this.generateStorageKey(reviewItemId);
    return await this.dataContext.get(key);
  }

  async getAllReviewItems() {
    var allItems = await this.dataContext.getAllValues((key) => key.indexOf(this.reviewItemsNamespace) == 0);
    return allItems;
  }

  generateReviewItemId(reviewItemType, reviewItemName) {
    return `${reviewItemType}/${reviewItemName}`;
  }

  generateStorageKey(reviewItemId) {
    return `${this.reviewItemsNamespace}/${reviewItemId}`;
  }

  isNullOrEmpty(str) {
    return (!str || 0 === str.length);
  }
}

class TagRepository {
  tagNamespace = "tags";
  dataContext;

  constructor(dataContext) {
    this.dataContext = dataContext;
  }

  async updateTag(tagDto) {
    if (this.isNullTagId(tagDto.tagId)) {
      throw new Error(`Tag update failed, tag id is null. Tag=${tagDto}`);
    }

    var key = this.generateStorageKey(tagDto.tagId);
    var tag = await this.dataContext.get(key);

    if (tag == null) {
      throw new Error(`Tag update failed, tag does not exist. Tag=${tagDto}`);
    }

    await this.dataContext.put(key, tagDto);
  }

  async putTag(tagDto) {
    if (!this.isNullTagId(tagDto.tagId)) {
      throw new Error(`Tag put failed, tag id must not be specified. Tag=${tagDto}`);
    }

    var tagId = (new Date()).getTime();
    var key = this.generateStorageKey(tagId);

    var tag = await this.dataContext.get(key);
    if (tag != null) {
      throw new Error(`Tag put failed, tag already exists. Tag=${tag}`);
    }

    tagDto.tagId = tagId;
    await this.dataContext.put(key, tagDto);
    return tagDto;
  }

  async getTag(tagId) {
    var key = this.generateStorageKey(tagId);
    return await this.dataContext.get(key);
  }

  async getTagByText(tagText) {
    var allTags = await this.dataContext
      .getAllValues((key) => key.indexOf(this.tagNamespace) == 0)
    var tagSearchResults = allTags
      .filter((tagDto) => tagDto.tagText == tagText);

    if (tagSearchResults == null || tagSearchResults.length == 0) {
      return null;
    }

    if (tagSearchResults.length > 1) {
      console.warn(`Warning: multiple tag entities exist with tagText=${tagText}`);
    }

    return tagSearchResults[0];
  }

  async getAllTags() {
    var allTags = await this.dataContext.getAllValues((key) => key.indexOf(this.reviewItemsNamespace) == 0);
    return allTags;
  }

  generateStorageKey(tagId) {
    return `${this.tagNamespace}/${tagId}`;
  }

  isNullTagId(tagId) {
    return tagId == null || tagId <= 0;
  }
}

//===================================================
//Data context

/**
 * Saves/retrieves data to userscript data storage
 * Note the GM. variant returns Promises
 */
class TamperMonkeyUserDataContext {

  constructor() {
  }

  /**
   * Sets data to the Tampermonkey user store
   * @param {*} key Key
   * @param {*} value Value
   * @returns Promise with no value on success, no value for rejected
   */
  put(key, value) {
    if (key == null || key == '') {
      throw new Error(`Cannot save with null key. Value=${value}`);
    }
    return GM.setValue(key, value)
  }

  /**
   * Get the value associated for the key
   * @param {*} key Key to fetch
   * @returns Promise
   */
  get(key) {
    return GM.getValue(key);
  }

  /**
   * Gets all keys
   * @returns Promise
   */
  getAllKeys() {
    return GM.listValues();
  }

  /**
   * Gets all values.
   * Optional: provide a key filtering function
   * Otherwise retrieves all values in database
   * @param {Func<string,bool>} keyFilter (Optional) Lambda with param for key and returns bool
   */
  getAllValues(keyFilter) {
    //No filter, return all items
    if (keyFilter == null) {
      keyFilter = (() => true);
    }

    return new Promise(async (resolve, reject) => {
      var getAllKeys = await this.getAllKeys();

      var filteredKeys = getAllKeys.filter(keyFilter);
      var getValueTasks = [];
      filteredKeys.forEach(key => {
        getValueTasks.push(this.get(key));
      });

      var filteredValues = await Promise.all(getValueTasks);
      resolve(filteredValues);
    });
  }
}

//===================================================
initialize();
