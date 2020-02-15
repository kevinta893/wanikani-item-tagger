// ==UserScript==
// @name        Wanikani Item Tagger
// @namespace   kevinta893
// @author      kevinta893
// @description Show whether the vocabulary word is common or not according to Jisho.org
// @run-at      document-end
// @include     https://www.wanikani.com/review/session
// @include     https://www.wanikani.com/lesson/session
// @include     https://www.wanikani.com/radicals/*
// @include     https://www.wanikani.com/kanji/*
// @include     https://www.wanikani.com/vocabulary/*
// @version     0.0.1
// @run-at      document-end
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_addStyle
// @connect     *
// ==/UserScript==


//Loads user script
function initialize(){
  var tagManager = new TagController();
  var taggerUi = new TaggerUiManager(tagManager);
}


//===================================================
//Userscript UI

var cssString = `
  .tag{
    cursor: pointer;
    display: inline-block;
    padding-left: 0.5em;
    padding-right: 0.5em;
    margin-right: 0.5em;
    background-color: #AA00FF;
    color: #eee;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    border-radius: 3px;
  }
  .tag:hover{

  }
  .user-tag-add-btn {
    cursor: pointer;
    margin-left: 0.3em;
  }
  .user-tag-add-btn:before {
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

class TaggerUiManager{
  tagController;
  tagInputField;
  tagList;
  tagUi;
  
  constructor(tagController){

    this.tagController = tagController;

    //Generate UI based on page location
    var pageUrl = window.location.href;
    this.tagUi = new TaggerUiFactory().createTaggerUi(pageUrl);

    //Add CSS
    GM_addStyle(cssString);
    GM_addStyle(this.tagUi.css);

    //Listen to tag add or remove events, save updated tags
    this.tagUi.onTagAdd((tagViewModel) => {
      this.saveTag(tagViewModel);
    });
    this.tagUi.onTagRemove((tagViewModel) => {
      this.removeTag(tagViewModel);
    });

    //Item changed event handler
    var itemChangedEvent = (key, callback) => {
      var currentItem = this.tagUi.getCurrentWkItem();

      var storedTags = this.tagController.getItemTags(currentItem.itemType, currentItem.itemName);
      this.tagUi.loadTagsToUi(storedTags);
    }

    //Every time item changes, update the tag list
    $.jStorage.listenKeyChange('currentItem', itemChangedEvent);
    $.jStorage.listenKeyChange('l/currentLesson', itemChangedEvent);

    // Load tag data to page
    var url = new URL(window.location.href);
    var pageUrlPathParts = url.pathname.split('/');
    var itemType = pageUrlPathParts[1];
    var itemName = decodeURIComponent(pageUrlPathParts[2]);
    var tags = this.tagController.getItemTags(itemType, itemName);
    this.tagUi.loadTagsToUi(tags);
  }

  removeTag(tagText){
    var rawWkData = this.tagUi.getCurrentWkItem();
    var currentTags = this.tagUi.getCurrentTags();

    var itemData = mapToTaggerItem(rawWkData, currentTags);
    this.tagController.updateItemTags(itemData);
  }

  saveTag(tagText){
    var rawWkData = this.tagUi.getCurrentWkItem();
    var currentTags = this.tagUi.getCurrentTags();
    
    var itemData = mapToTaggerItem(rawWkData, currentTags);
    this.tagController.updateItemTags(itemData);
  }
}

/**
 * Creates a tagger UI based on the page
 * that the script is current on
 */
class TaggerUiFactory{
  constructor(){

  }

  createTaggerUi(pageUrl){
    //Add UI (depending on page)
    if (pageUrl.indexOf('wanikani.com/review/session') >= 0){
      // Review
      throw new Error('Not implemented');
    } else if (pageUrl.indexOf('wanikani.com/lesson/session') >= 0){
      // Lesson
      return new ReviewTaggerUi();
    } else if (
      pageUrl.indexOf('wanikani.com/radicals') ||
      pageUrl.indexOf('wanikani.com/kanji') ||
      pageUrl.indexOf('wanikani.com/vocabulary')
    ){
      //Wanikani item definition pages
      return new DefinitionTaggerUi();
    } else {
      //No match
      throw new Error('Cannot attach UI, invalid page.');
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
class BaseTaggerUi{

  /**
   * Additional CSS to add
   */
  css = ``;
  listenersTagAdded = [];
  listenersTagRemoved = [];

  constructor(){

  }

  addTag(tagText){
    //Private
  }

  removeTag(tagText){
    //Private
  }

  /**
   * Loads a list of tag strings to the UI
   * for display
   * @param {Array} tagList 
   */
  loadTagsToUi(tagList){
  }

  triggerTagAddEvent(tagText){
    //Private
    this.listenersTagAdded.forEach(func => {
      func(tagText);
    });
  }

  triggerTagRemoveEvent(tagText){
    //Private
    this.listenersTagRemoved.forEach(func => {
      func(tagText);
    });
  }

  /**
   * Adds a callback for when the UI recieves
   * a new tag entered by the user
   * @param {function} callback 
   */
  onTagAdd(callback){
    this.listenersTagAdded.push(callback);
  }

  /**
   * Adds a callback for when the UI recieves
   * a new tag is removed by the user
   * @param {function} callback 
   */
  onTagRemove(callback){
    this.listenersTagRemoved.push(callback);
  }

  /**
   * Gets the current tag strings that are 
   * being displayed by the UI currently
   */
  getCurrentTags(){

  }

  /**
   * Gets the current WaniKani item data from the page
   */
  getCurrentWkItem(){

  }
}

class ReviewTaggerUi extends BaseTaggerUi{

  rootElement;
  css = ``;
  tagListElem;

  constructor(){
    super();

    //Add to Meaning section
    var rootElement = $('#supplement-voc-meaning > div > div.pure-u-1-4.col1');

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

      var newItemModel = new TaggerItemViewModel();
      newItemModel.tagText = newTagText;

      this.addTag(newItemModel);

      //Trigger event callbacks
      this.triggerTagAddEvent(newItemModel);
    };

    addTagButton.on('click', tagEnteredCallback);
    tagInput.on('keypress',function(e) {
      if(e.which == 13) {
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
  }

  loadTagsToUi(tagList){
    this.tagListElem.find('.tag').remove();

    tagList.forEach(tag => {
      this.addTag(tag);
    });
  }

  addTag(tagViewModel){
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

  removeTag(tagViewModel){
    this.tagListElem.find(`.tag[value="${tagViewModel.tagText}"]`).get(0).remove();
  }

  getCurrentTags(){
    var currentTags = this.tagListElem.find('.tag')
      .map((i, tagElem) => $(tagElem).data('view-model'));
    return Array.from(currentTags);
  }

  getCurrentWkItem(){
    // TODO Move this to a "data provider" kind of class
    // For fetching raw data off the current page
    //Gather data from page
    var pageUrl = window.location.href;
    var currentItem;
    if (pageUrl.indexOf('lesson') >= 0){
      currentItem = $.jStorage.get('l/currentLesson');
    }
    else{
      currentItem = $.jStorage.get('currentItem');
    }

    var wkItemData = new WanikaniItemModel();

    //Determine item type
    var itemType = '';
    var itemName = '';
    if (currentItem.hasOwnProperty('voc')){
      itemType = ItemTypes.Vocabulary;
      itemName = currentItem.voc;
    } 
    else if (currentItem.hasOwnProperty('kan')){
      itemType = ItemTypes.Kanji;
      itemName = currentItem.kan;
    }
    else if (currentItem.hasOwnProperty('rad')){
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
class DefinitionTaggerUi extends BaseTaggerUi{

  rootElement;
  css = ``;
  tagListElem;

  constructor(){
    super();

    //Configure the UI for the definition page
    var rootElement = $('#information');

    var tagSection = $('<div></div>');
    tagSection.addClass('alternative-meaning')

    var tagSectionTitle = $('<h2></h2>');
    tagSectionTitle.text('Tags');

    //Input tag button
    var tagInputButton = $('<li></li>')
    tagInputButton.addClass('user-tag-add-btn');
    tagInputButton.attr('title', 'Add your own tags');
    tagInputButton.attr('style', 'display: inline-block;');

    var addTagFormRoot = $('<li></li>');
    addTagFormRoot.attr('style', 'display: inline-block;');
    addTagFormRoot.hide();

    //Tag text input box
    var tagInput = $('<input></input>');
    tagInput.attr('type', 'text');
    tagInput.attr('autocaptialize', 'none');
    tagInput.attr('autocomplete', 'on');
    tagInput.attr('spellcheck', 'off');
    tagInput.attr('autocorrect', 'false');

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

      var newItemModel = new TaggerItemViewModel();
      newItemModel.tagText = newTagText;

      this.addTag(newTagText);

      //Trigger event callbacks
      this.triggerTagAddEvent(newTagText);
    };

    addTagButton.on('click', tagEnteredCallback);
    tagInput.on('keypress',function(e) {
      if(e.which == 13) {
        tagEnteredCallback();
      }
    });

    var ulButtonParent = $('<ul></ul>');
    ulButtonParent.append(tagInputButton);
    ulButtonParent.append(addTagFormRoot);

    tagSection.append(tagSectionTitle);
    tagSection.append(ulButtonParent);
    
    this.tagListElem = ulButtonParent;
    rootElement.append(tagSection);

    this.rootElement = rootElement;
  }

  loadTagsToUi(tagList){
    this.tagListElem.find('.tag').remove();

    tagList.forEach(tag => {
      this.addTag(tag);
    });
  }

  addTag(tagViewModel){
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

    this.tagListElem.find('li.user-tag-add-btn').before(newTag);
  }

  removeTag(tagViewModel){
    this.tagListElem.find(`.tag[value="${tagViewModel.tagText}"]`).get(0).remove();
  }

  getCurrentTags(){
    var currentTags = this.tagListElem.find('.tag')
      .map((i, tagElem) => $(tagElem).data('view-model'));
    return Array.from(currentTags);
  }

  getCurrentWkItem(){
    // TODO Move this to a "data provider" kind of class
    // For fetching raw data off the current page
    //Gather data from page
    var url = new URL(window.location.href);
    var pageUrlPathParts = url.pathname.split('/');
    var itemTypeRaw = pageUrlPathParts[1].toLowerCase();
    var itemName = decodeURIComponent(pageUrlPathParts[2]);

    var wkItemData = new WanikaniItemModel();

    //Determine item type
    var itemType = '';
    if (itemTypeRaw.toLowerCase() == ItemTypes.Vocabulary.toLowerCase()){
      itemType = ItemTypes.Vocabulary;
    } 
    else if (itemTypeRaw.toLowerCase() == ItemTypes.Kanji.toLowerCase()){
      itemType = ItemTypes.Kanji;
    }
    else if (itemTypeRaw.toLowerCase() == ItemTypes.Radical.toLowerCase()){
      itemType = ItemTypes.Radical;
    }
    
    wkItemData.itemName = itemName;
    wkItemData.itemType = itemType;

    return wkItemData;
  }
}

//===================================================
//Item types enum

const ItemTypes = {
  Vocabulary: 'Vocabulary',
  Kanji: 'Kanji',
  Radical: 'Radical'
};


//===================================================
//WaniKani data object

/**
 * An object model of the Wanikani item
 * Contains only data that can be extracted from WaniKani
 */
class WanikaniItemModel{
  itemName = '';
  itemType = '';
}


//===================================================
//Tagger Item View Model

/**
 * Represents data for 1 tag
 * Contains information on how to display the tag on the UI
 */
class TaggerItemViewModel{
  tagText = '';
  tagColor = '#AA00FF';
}

//===================================================
//Tagger Item DTO

/**
 * Represents a data transfer object (DTO). It contains 
 * the relevant WaniKani item data required
 * for the tagger's main functions
 */
class TaggerItemDTO{

  //Wanikani app official fields
  itemType = '';
  itemName = '';

  //Item Tagger fields
  tags = [];    //a list of type TaggerItemViewModel

  constructor(){
  }
}

/**
 * Factory function that converts a wanikani item data object from local storage
 * and maps it to the DTO object WanikaniItem.
 * @param {WanikaniItemModel} wkItemModel A wanikani item data object representing the wanikani item on the page
 * @param {Array} currentTags (optional) An array/list of current user defined tags associated with the item, otherwise it is an empty list
 */
function mapToTaggerItem(wkItemModel, currentTags){
  var taggerItem = new TaggerItemDTO();

  //Current tags is null, default to empty list
  if (currentTags == null){ currentTags = []; }

  //Map fields
  taggerItem.itemName = wkItemModel.itemName;
  taggerItem.itemType = wkItemModel.itemType;
  taggerItem.tags = currentTags;
  
  return taggerItem;
}

//===================================================
//Tag managment

/**
 * Manages tag data, transforming it to something
 * that can be saved for later
 */
class TagController{
  tagRepository;
  
  constructor(){
    this.tagRepository = new TagRepository();
  }

  updateItemTags(tagItemDto){
    console.debug(tagItemDto);
    this.tagRepository.saveTag(tagItemDto);
  }

  getItemTags(itemType, itemName){
    return this.tagRepository.getTags(itemType, itemName);
  }
}


//===================================================
//Tag storage repository

/**
 * Manages raw tag data, storing and reading raw data
 */
class TagRepository{
  tagDataStoreKey = "tag-data";
  dataContext;

  constructor(){
    this.dataContext = new TamperMonkeyUserDataContext();
  }

  saveTag(tagItemDto){
    var key = this.generateStoreKeyFromDto(tagItemDto);
    this.dataContext.writeData(key, tagItemDto);
  }

  getTags(itemType, itemName){
    var key = this.generateStoreKey(itemType, itemName);
    var itemData = this.dataContext.readData(key);
    return itemData == null ? [] : itemData.tags;
  }

  generateStoreKey(itemType, itemName){
    return `${this.tagDataStoreKey}/${itemType.toLowerCase()}/${itemName}`;
  }

  generateStoreKeyFromDto(tagItemDto){
    return this.generateStoreKey(tagItemDto.itemType, tagItemDto.itemName);
  }
}

//===================================================
//Data context

/**
 * Saves/retrieves data to user data storage
 */
class TamperMonkeyUserDataContext{

  constructor(){
  }

  writeData(key, value){
    if (key == null || key == ''){
      throw new Error(`Cannot save with null key. alue=${value}`);
    }
    GM_setValue(key, value);
  }

  readData(key){
    return GM_getValue(key);
  }
}


//===================================================
initialize();
