class TagEditorView {
  html = `
    <div>
      <div>
        <div id="tag-color-picker"></div>
        <input id="tag-ui-input" type="text" autocaptialize="none" autocomplete="on" spellcheck="off" autocorrect="false" maxlength="${Constants.MAX_TAG_TEXT_LENGTH}">
        <button id="tag-ui-input-submit" class="tag-ui-add-btn"></button>
      </div>
      <div>
        <div id="tag-picker-list"></div>
      </div>
    </div>
  `;
  newPickableTagHtml = `
    <div></div>
  `;

  tagPickerListElem;
  tagPickList = {};

  eventTagSelectionChanged = new EventEmitter();

  /**
   * Creates a tag editor view
   * @param {string} el Selector of the element to replace
   * @param {object} options Options for this tag editor
   */
  constructor(el, options) {
    // Configure the UI for the definition page
    var rootElement = $(el);
    rootElement.replaceWith(this.html);

    this.tagPickerListElem = $('#tag-picker-list');
    
    //Disable tag enter button when text empty
    // tagInput.on('keyup', function (e) {
    //   var inputText = tagInput.val();
    //   if (inputText.length <= 0) {
    //     addTagButton.prop('disabled', true);
    //   } else {
    //     addTagButton.prop('disabled', false);
    //   }
    // });

    // tagInput.on('change', function (e){
    //   var trimmedText = tagInput.val().trim();
    //   tagInput.val(trimmedText);
    // });

    //When new tag is submitted
    // var tagEnteredCallback = () => {
    //   var newTagText = tagInput.val();
    //   tagInput.val('');
    //   addTagButton.prop('disabled', true);
    //   addTagFormRoot.hide();
    //   tagInputButton.show();

    //   var newItemModel = new TagViewModel();
    //   newItemModel.tagText = newTagText;
    //   newItemModel.tagColor = this.colorPicker.getSelectedColor();

    //   //Trigger event callbacks
    //   var reviewItemViewModel = this.getCurrentReviewItemViewModel();
    //   this.eventTagAdded.emit(reviewItemViewModel, newItemModel);
    // };

    // //Enter button used to submit
    // addTagButton.on('click', tagEnteredCallback);
    // tagInput.on('keyup', function (e) {
    //   var inputText = tagInput.val();
    //   if (e.which == 13 && inputText.length > 0) {
    //     tagEnteredCallback();
    //   }
    // });
  }

  setTagSelection(tagId, isSelected){
    this.tagPickList[tagId].setSelection(isSelected);
  }

  loadTagOptions(listOfTagViewModels) {
    listOfTagViewModels.forEach(tagViewModel => {
      this.addTagPickOption(tagViewModel);
    });
  }

  addTagPickOption(tagViewModel) {
    // Create dom to attach to
    var newTagPickOption = $(this.newPickableTagHtml);
    var newTagPickId = `tag-option-${tagViewModel.tagId}`;
    newTagPickOption.attr('id', newTagPickId);
    this.tagPickerListElem.append(newTagPickOption);

    // Create tag picker option
    var tagPickOption = new SelectableTagView(`#${newTagPickId}`, tagViewModel);
    tagPickOption.bindTagSelectChanged((tagViewModel, isSelected) => { 
      this.eventTagSelectionChanged.emit(tagViewModel, isSelected);
    });
    tagPickOption.bindTagEditClicked(() => { });
    this.tagPickList[tagViewModel.tagId] = tagPickOption;
  }

  bindTagSelectionChanged(handler){
    this.eventTagSelectionChanged.addEventListener(handler);
  }
}