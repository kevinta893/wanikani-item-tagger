// ==UserScript==
// @name        Wanikani Item Tagger
// @namespace   kevinta893
// @author      kevinta893
// @description Show whether the vocabulary word is common or not according to Jisho.org
// @run-at      document-end
// @include     https://www.wanikani.com/review/session
// @include     https://www.wanikani.com/lesson/session
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
  }
  .favorite-svg{
  }
`;

class TaggerUi{
  tagManager;
  tagInputField;

  constructor(tagManager){

    this.tagManager = tagManager;

    //Add CSS
    GM_addStyle(cssString);

    //Add UI
    var rootTagEditElement = '#supplement-voc-meaning > div > div.pure-u-1-4.col1';

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
    $(rootTagEditElement).append(tagSectionHeader);
    $(rootTagEditElement).append(tagSectionContents);

    //Item changed event handler
    var updateTagInfo = this.updateTagInfo;
    var itemChangedEvent = function(key, callback){
      var currentItem = $.jStorage.get(key);
      var taggerItem = mapTaggerItem(currentItem);

      updateTagInfo(taggerItem);
    }

    //Every time item changes, update the tag list
    $.jStorage.listenKeyChange('currentItem', itemChangedEvent);
    $.jStorage.listenKeyChange('l/currentLesson', itemChangedEvent);
  }

  updateTagInfo(item){
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
  partOfSpeech = [];
  level = -1;

  //Item Tagger fields
  userTags = [];

  constructor(){
  }
}

/**
 * Converts a wanikani item data object from local storage
 * and maps it to the DTO object WanikaniItem.
 * @param {} currentItem A wanikani item data object from local storage
 */
function mapTaggerItem(wkItem){
  var taggerItem = new TaggerItemDTO();

  taggerItem.level = wkItem.level;

  //Map item type
  if (wkItem.hasOwnProperty('voc')){
    taggerItem.type = ItemTypes.Vocabulary;
  }
  else if (wkItem.hasOwnProperty('kan')){
    taggerItem.type = ItemTypes.Kanji;
  }
  else if (wkItem.hasOwnProperty('rad')){
    taggerItem.type = ItemTypes.Radical;
  }
  
  return wkItem;
}

//===================================================
//Tag managment

/**
 * Manages tag data, transforming it to something
 * that can be saved for later
 */
class TagManager{
  tagRepository;
  tagData;

  constructor(){
    this.tagRepository = new TagRepository();
    this.tagData = this.tagRepository.readTags();
  }

  addTag(reviewItem, tag){
    //Add tag to existing tags
    if (this.tagData.hasProperty(reviewItem)){
      var item = this.tagData[reviewItem];
      item.tags.append(tag);
    }
  
    //Create a new tag
    var newItem = {
      reviewItem : reviewItem,
      tags : []
    };
    this.tagData[reviewItem] = newItem;
  }

  removeTag(reviewItem, tag){
    if (this.tagData.hasProperty(reviewItem)){
      var item = this.tagData[reviewItem];
      item.tags.remove(tag);
    }
  }

  saveTagData(){
    this.tagRepository.saveTags(this.tagData);
  }
}


//===================================================
//Tag storage repository

/**
 * Manages raw tag data, storing and reading raw data
 */
class TagRepository{
  tagDataStoreKey = "wanikani-item-tagger-tag-data";
  dataContext;

  constructor(){
    this.dataContext = new TamperMonkeyDataContext();
  }

  saveTags(tagData){
    this.dataContext.writeData(this.tagDataStoreKey, tagData);
  }

  readTags(){
    return this.dataContext.readData(this.tagDataStoreKey);
  }
}

//===================================================
//Data context

/**
 * Saves/retrieves data to user data storage
 */
class TamperMonkeyDataContext{

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
