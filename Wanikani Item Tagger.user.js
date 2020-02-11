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




var taggerUi;
var tagManager;

//Loads user script
function initialize(){
  tagManager = new TagManager();
  taggerUi = new TaggerUi(tagManager);
}


//===================================================
//Userscript UI

var cssString = `
  .tag{
    display: inline-block;
    margin-right: 0.5em;
    background-color: #AA00FF;
    color: #eee;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    border-radius: 3px;
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

class TaggerUi{
  tagManager;
  tagInputField;
  tagList;

  constructor(tagManager){

    this.tagManager = tagManager;

    //Add CSS
    GM_addStyle(cssString);

    //Add UI (depending on page)
    var pageUrl = window.location.href;
    if (pageUrl.indexOf('wanikani.com/review/session') >= 0){
      // Review
    } else if (pageUrl.indexOf('wanikani.com/lesson/session') >= 0){
      // Lesson 
      var rootElement = $('#supplement-voc-meaning > div > div.pure-u-1-4.col1');

      // Tag section Title
      var tagSectionHeader = $('<h2></h2>');
      tagSectionHeader.text('Tags');

      // Tag section
      var tagSectionContents = $('<div></div>');

      var tagInputField = $('<input></input>');
      tagInputField.attr('id', 'custom-tag-list');
      tagInputField.addClass('noSwipe');
      tagSectionContents.append(tagInputField);
      this.tagInputField = tagInputField;

      //Append UI elements
      rootElement.append(tagSectionHeader);
      rootElement.append(tagSectionContents);
    } else if (
      pageUrl.indexOf('wanikani.com/radicals') ||
      pageUrl.indexOf('wanikani.com/kanji') ||
      pageUrl.indexOf('wanikani.com/vocabulary')
    ){
      // Wanikani item definition pages
      var rootElement = $('#information');

      var tagSection = $('<div></div>');
      tagSection.addClass('alternative-meaning')

      var tagSectionTitle = $('<h2></h2>');
      tagSectionTitle.text('Tags');
      var tagInputButton = $('<li></li>')
      tagInputButton.addClass('user-tag-add-btn');
      tagInputButton.attr('title', 'Add your own tags');
      tagInputButton.attr('style', 'display: inline-block;');

      var addTagFormRoot = $('<li></li>');
      addTagFormRoot.attr('style', 'display: inline-block;');
      addTagFormRoot.hide();

      var tagInput = $('<input></input>');
      tagInput.attr('type', 'text');
      tagInput.attr('autocaptialize', 'none');
      tagInput.attr('autocomplete', 'off');
      tagInput.attr('spellcheck', 'off');
      tagInput.attr('autocorrect', 'false');

      var addTagButton = $('<button></button>');
      addTagButton.addClass('user-tag-add-btn');

      addTagFormRoot.append(tagInput);
      addTagFormRoot.append(addTagButton);


      tagInputButton.on('click', () => {
        tagInputButton.hide();
        addTagFormRoot.show();
        tagInput.val('');

        tagInput.focus();
      });

      addTagButton.on('click', () => {
        var newTagText = tagInput.val();
        console.log(newTagText);
        //TODO!!!! sanitize(newTagText);
        tagInput.val('');
        tagInputButton.show();
        addTagFormRoot.hide();

        this.saveTag(newTagText);
        this.addTagToUi(newTagText);
      });

      var ulButtonParent = $('<ul></ul>');
      ulButtonParent.append(tagInputButton);
      ulButtonParent.append(addTagFormRoot);

      tagSection.append(tagSectionTitle);
      tagSection.append(ulButtonParent);
      
      this.tagList = ulButtonParent;
      rootElement.append(tagSection);

      // Load tag data to page
      var url = new URL(window.location.href);
      var pageUrlPathParts = url.pathname.split('/');
      var itemType = pageUrlPathParts[1];
      var itemName = decodeURIComponent(pageUrlPathParts[2]);
      var tags = this.tagManager.getItemTags(itemType, itemName);
      tags.forEach((elem) => {
        this.addTagToUi(elem);
      });
    } else {
      console.log('Cannot attach UI, invalid page');
    }

    //Item changed event handler
    var updateTagInfo = this.updateTagInfo;
    var itemChangedEvent = (key, callback) => {
      var currentItem = $.jStorage.get(key);
      var taggerItem = mapTaggerItem(currentItem);

      updateTagInfo(taggerItem);
    }

    //Every time item changes, update the tag list
    $.jStorage.listenKeyChange('currentItem', itemChangedEvent);
    $.jStorage.listenKeyChange('l/currentLesson', itemChangedEvent);
  }

  addTagToUi(tagText){
    var newTag = $('<li></li>');
    //TODO Sanitize html
    newTag.addClass('tag');
    newTag.attr('title', 'Click to remove tag');
    newTag.attr('value', tagText);
    newTag.text(tagText);
    newTag.on('click', newTag.remove);

    this.tagList.find('li.user-tag-add-btn').before(newTag);
  }

  removeTag(){

  }

  saveTag(tagText){
    var rawWkData = this.getCurrentWanikaniItemData();
    var currentTags = Array.from(this.tagList.find('.tag').map((i, tagElem) => $(tagElem).attr('value')));
    var wkItemData = mapToTaggerItem(rawWkData, currentTags);
    this.tagManager.updateItemTag(wkItemData, tagText);
  }

  getCurrentWanikaniItemData(){
    // TODO Move this to a "data provider" kind of class
    // For fetching raw data off the current page
    var url = new URL(window.location.href);
    var pageUrlPathParts = url.pathname.split('/');
    var itemType = pageUrlPathParts[1];
    var itemName = decodeURIComponent(pageUrlPathParts[2]);
    var fakeWkData = {};
    fakeWkData.voc = itemName;
    return fakeWkData;
  }
}

//===================================================
//Tagger Item DTO

const ItemTypes = {
  Vocabulary: 'Vocabulary',
  Kanji: 'Kanji',
  Radical: 'Radical'
};

/**
 * Represents a data transfer object (DTO). It contains 
 * the relevant WaniKani item data required
 * for the tagger to work.
 */
class TaggerItemDTO{

  //Wanikani app official fields
  itemType = '';
  displayName = '';
  level = -1;

  //Item Tagger fields
  tags = [];

  constructor(){
  }
}

/**
 * Factory function that converts a wanikani item data object from local storage
 * and maps it to the DTO object WanikaniItem.
 * @param {} wkItem A wanikani item data object from local storage
 * @param {Array} currentTags (optional) An array/list of current user defined tags associated with the item, otherwise it is an empty list
 */
function mapToTaggerItem(wkItem, currentTags){
  var taggerItem = new TaggerItemDTO();

  //Current tags is default
  if (currentTags == null){ currentTags = []; }

  //Determine type and the name
  var itemType;
  var itemDisplayName;
  if (wkItem.hasOwnProperty('voc')){
    itemType = ItemTypes.Vocabulary;
    itemDisplayName = wkItem.voc;
  }
  else if (wkItem.hasOwnProperty('kan')){
    itemType = ItemTypes.Kanji;
    itemDisplayName = wkItem.kan;
  }
  else if (wkItem.hasOwnProperty('rad')){
    itemType = ItemTypes.Radical;
    itemDisplayName = wkItem.rad;
  }

  taggerItem.displayName = itemDisplayName;
  taggerItem.type = itemType;
  taggerItem.level = wkItem.level;
  taggerItem.tags = currentTags;
  
  return taggerItem;
}

//===================================================
//Tag managment

/**
 * Manages tag data, transforming it to something
 * that can be saved for later
 */
class TagManager{
  tagRepository;
  
  constructor(){
    this.tagRepository = new TagRepository();
  }

  updateItemTag(tagItemDto, tag){
    tagItemDto.tags.push(tag);
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
    return this.generateStoreKey(tagItemDto.type, tagItemDto.displayName);
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
    GM_setValue(key, value);
  }

  readData(key){
    return GM_getValue(key);
  }
}


//===================================================
initialize();
