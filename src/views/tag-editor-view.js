class TagEditorView {
  html = `
    <div id="tag-editor">
      <div>
        <div id="tag-color-picker"></div>
        <input id="tag-ui-input" type="text" autocaptialize="none" autocomplete="on" spellcheck="off" autocorrect="false" maxlength="${Constants.MAX_TAG_TEXT_LENGTH}">
        <button id="tag-ui-input-submit" class="tag-ui-add-btn" disabled>AddTag</button>
      </div>
      <div>
        <div id="tag-picker-list"></div>
      </div>
    </div>
  `;
  newPickableTagHtml = `
    <div></div>
  `;

  tagEditorFormRoot;
  tagPickerListElem;
  tagPickMap = {};
  tagPickList = [];

  eventTagSelectionChanged = new EventEmitter();
  eventNewTagCreated = new EventEmitter();
  evetnTagDeleted = new EventEmitter();

  /**
   * Creates a tag editor view
   * @param {string} el Selector of the element to replace
   * @param {object} options Options for this tag editor
   */
  constructor(el, options) {
    // Configure the UI for the definition page
    var rootElement = $(el);
    rootElement.replaceWith(this.html);

    var tagPickerList = this.tagPickerListElem = $('#tag-picker-list');
    var tagEditorFromRoot = this.tagEditorFormRoot = $('#tag-editor');
    var newTagInput = $('#tag-ui-input');
    var addNewTagButton = $('#tag-ui-input-submit');
    var tagColorPicker = this.colorPicker = new TagColorPickerView('#tag-color-picker');

    //Disable tag enter button when text empty
    newTagInput.on('keyup', function (e) {
      var inputText = newTagInput.val();
      if (inputText.length <= 0) {
        addNewTagButton.prop('disabled', true);
      } else {
        addNewTagButton.prop('disabled', false);
      }
    });

    newTagInput.on('change', function (e){
      var trimmedText = newTagInput.val().trim();
      newTagInput.val(trimmedText);
    });

    //When new tag is submitted
    var tagEnteredCallback = () => {
      var newTagText = newTagInput.val();
      newTagInput.val('');
      addNewTagButton.prop('disabled', true);

      var newItemModel = new TagViewModel();
      newItemModel.tagText = newTagText;
      newItemModel.tagColor = this.colorPicker.getSelectedColor();

      this.eventNewTagCreated.emit(newItemModel);
    };

    //Enter button used to submit
    addNewTagButton.on('click', tagEnteredCallback);
    newTagInput.on('keyup', (e) => {
      var inputText = newTagInput.val();
      if (e.which == 13 && inputText.length > 0) {
        tagEnteredCallback();
      }
    });
  }

  show(){
    this.tagEditorFormRoot.show();
  }

  hide(){
    this.tagEditorFormRoot.hide();
  }

  loadReviewItemSelection(reviewItemViewModel){
    this.deselectAllTags();

    reviewItemViewModel.tags.forEach(tagViewModel => {
      this.tagPickMap[tagViewModel.tagId].setSelection(true);
    });
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

    this.tagPickMap[tagViewModel.tagId] = tagPickOption;
    this.tagPickList.push(tagPickOption);
  }

  deselectAllTags(){
    this.tagPickList.forEach(selectableTagView => {
      selectableTagView.setSelection(false);
    });
  }

  bindTagSelectionChanged(handler){
    this.eventTagSelectionChanged.addEventListener(handler);
  }
  
  bindNewTagCreated(handler){
    this.eventNewTagCreated.addEventListener(handler);
  }

  bindTagDeleted(handler){
    this.evetnTagDeleted.addEventListener(handler);
  }
}