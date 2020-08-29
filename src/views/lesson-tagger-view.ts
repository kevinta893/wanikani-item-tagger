/**
 * Tagger UI for the lesson pages
 * These pages are unique in that the lesson and
 * the quiz are both in the same page.
 * The lesson itself also contains 3 different versions
 * of the information cards, which all need the tagger UI
 */
class LessonTaggerView {

  rootElement;
  css = ``;
  tagListElem;

  constructor() {

    // //Add UI to meaning section of a Lesson (before quiz)
    // var lessonVocabInformationSelector = '#supplement-voc-meaning > div > div.pure-u-1-4.col1';
    // var lessonKanjiInformationSelector = '#supplement-kan-meaning > div > div.pure-u-1-4.col1';
    // var lessonRadicalInformationSelector = '#supplement-rad-name > div > div';
    // var quizInformationSelector = '#item-info-col1'
    // var allSelectors = [
    //   lessonVocabInformationSelector,
    //   lessonKanjiInformationSelector,
    //   lessonRadicalInformationSelector,
    //   quizInformationSelector
    // ];

    // var rootElement = $(allSelectors.join(','));

    // var tagSection = $('<div></div>');

    // var tagSectionTitle = $('<h2></h2>');
    // tagSectionTitle.text('Tags');

    // var tagList = $('<div></div>');
    // tagList.attr('id', 'tag-list');

    // //Input tag button
    // var tagInputButton = $('<button></button>')
    // tagInputButton.addClass('user-tag-add-btn');
    // tagInputButton.attr('title', 'Add your own tags');
    // tagInputButton.attr('style', 'display: inline-block;');

    // var addTagFormRoot = $('<div></div>');
    // addTagFormRoot.attr('style', 'display: inline-block;');
    // addTagFormRoot.hide();

    // //Tag text input box
    // var tagInput = $('<input></input>');
    // tagInput.attr('type', 'text');
    // tagInput.attr('autocaptialize', 'none');
    // tagInput.attr('autocomplete', 'on');
    // tagInput.attr('spellcheck', 'off');
    // tagInput.attr('autocorrect', 'false');
    // tagInput.addClass('noSwipe');
    // tagInput.off();

    // //Confirm button when tag entry is complete
    // var addTagButton = $('<button></button>');
    // addTagButton.addClass('user-tag-add-btn');

    // addTagFormRoot.append(tagInput);
    // addTagFormRoot.append(addTagButton);

    // //Input tag button When clicked, opens up a textbox for tag entry
    // tagInputButton.on('click', () => {
    //   tagInputButton.hide();
    //   addTagFormRoot.show();
    //   tagInput.val('');

    //   tagInput.focus();
    // });

    // //When new tag is submitted
    // var tagEnteredCallback = () => {
    //   var newTagText = tagInput.val();
    //   //TODO!!!! sanitize(newTagText);
    //   tagInput.val('');
    //   addTagFormRoot.hide();
    //   tagInputButton.show();

    //   var newItemModel = new TagViewModel();
    //   newItemModel.tagText = newTagText;

    //   this.addTag(newItemModel);

    //   //Trigger event callbacks
    //   this.triggerTagAddEvent(newItemModel);
    // };

    // addTagButton.on('click', tagEnteredCallback);
    // tagInput.on('keypress', function (e) {
    //   if (e.which == 13) {
    //     tagEnteredCallback();
    //   }
    // });

    // var ulButtonParent = $('<div></div>');
    // ulButtonParent.append(tagInputButton);
    // ulButtonParent.append(addTagFormRoot);

    // tagSection.append(tagSectionTitle);
    // tagSection.append(tagList);
    // tagSection.append(ulButtonParent);

    // this.tagListElem = tagList;
    // rootElement.append(tagSection);

    // this.rootElement = rootElement;

    //Every time item changes, update the tag list
    // $.jStorage.listenKeyChange('currentItem', itemChangedEvent);
    // $.jStorage.listenKeyChange('l/currentLesson', itemChangedEvent);
  }
/*
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
  }*/
}