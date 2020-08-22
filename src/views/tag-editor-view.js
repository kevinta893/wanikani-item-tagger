class TagEditorView {
  html = `
    <div id="tag-editor">
      <div id="tag-edit-form">
        <div id="tag-edit-color-picker"></div>
        <input id="tag-edit-input" type="text" autocaptialize="none" autocomplete="on" spellcheck="off" autocorrect="false" maxlength="${Constants.MAX_TAG_TEXT_LENGTH}">
        <button id="tag-edit-input-submit" class="tag-ui-add-btn" disabled>AddTag</button>
      </div>
      <div id="tag-create-form">
        <div id="tag-create-color-picker"></div>
        <input id="tag-create-input" type="text" autocaptialize="none" autocomplete="on" spellcheck="off" autocorrect="false" maxlength="${Constants.MAX_TAG_TEXT_LENGTH}">
        <button id="tag-create-input-submit" class="tag-ui-add-btn" disabled>AddTag</button>
      </div>
      <div id="tag-picker-list"></div>
    </div>
  `;
  newPickableTagHtml = `
    <div></div>
  `;

  rootElement;
  tagEditorRootElem;

  tagEditForm;
  tagEditForm;
  tagEditInput;
  tagEditSubmitBtn;
  tagEditColorPicker;

  tagCreateForm;
  tagCreateForm;
  tagCreateInput;
  tagCreateSubmitBtn;
  tagCreateColorPicker

  tagPickerListElem;
  tagPickMap = {};
  tagPickList = [];

  eventTagSelectionChanged = new EventEmitter();
  eventTagCreated = new EventEmitter();
  eventTagUpdated = new EventEmitter();
  eventTagDeleted = new EventEmitter();

  /**
   * Creates a tag editor view
   * @param {string} el Selector of the element to replace
   * @param {object} options Options for this tag editor
   */
  constructor(el, options) {
    // Configure the UI for the definition page
    var rootElement = $(this.html);
    $(el).replaceWith(rootElement);

    this.tagEditorRootElem = $('#tag-editor');

    this.tagEditForm = $('#tag-edit-form');
    this.tagEditForm.hide();
    this.tagEditInput = $('#tag-edit-input');
    this.tagEditSubmitBtn = $('#tag-edit-input-submit');
    this.tagEditColorPicker = new TagColorPickerView('#tag-edit-color-picker');

    this.tagCreateForm = $('#tag-create-form');
    this.tagCreateForm.show();
    this.tagCreateInput = $('#tag-create-input');
    this.tagCreateSubmitBtn = $('#tag-create-input-submit');
    this.tagCreateColorPicker = new TagColorPickerView('#tag-create-color-picker');

    this.tagPickerListElem = $('#tag-picker-list');

    this.hide();

    //Disable tag enter button when text empty
    this.tagCreateInput.on('input', (e) => {
      var inputText = this.tagCreateInput.val();
      if (inputText.length <= 0) {
        this.tagCreateSubmitBtn.prop('disabled', true);
      } else {
        this.tagCreateSubmitBtn.prop('disabled', false);
      }
    });

    //Text changed, show relevant simular tags
    this.tagCreateInput.on('input', (e) => {
      var inputText = this.tagCreateInput.val();

      if (inputText.length > 0) {
        this.showSearchTagName(inputText);
      } else {
        this.showAllTags();
      }
    });

    //Trim text input
    this.tagCreateInput.on('change', (e) => {
      var trimmedText = this.tagCreateInput.val().trim();
      this.tagCreateInput.val(trimmedText);
    });

    //Enter button used to submit
    this.tagCreateSubmitBtn.on('click', (e) => this.newTagEntered());
    this.tagCreateInput.on('keyup', (e) => {
      if (e.which == 13) {
        this.newTagEntered();
      }
    });

    // Dropdown loses focus, hide
    // rootElement.focusout((e) => {
    //   var newFocusedElem = $(':focus');
    //   if (rootElement.has(newFocusedElem).length == 0) {
    //     this.hide();
    //   }
    // });
  }

  newTagEntered() {
    var newTagText = this.tagCreateInput.val();
    if (newTagText.length <= 0){
      return;
    }

    this.tagCreateInput.val('');
    this.tagCreateSubmitBtn.prop('disabled', true);

    var newItemModel = new TagViewModel();
    newItemModel.tagText = newTagText;
    newItemModel.tagColor = this.tagCreateColorPicker.getSelectedColor();

    this.eventTagCreated.emit(newItemModel);
  };

  toggleEditorView() {
    var isVisible = this.isViewVisible();
    if (isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  isViewVisible() {
    return this.tagEditorRootElem.hasClass('tag-editor-show')
  }

  show() {
    this.tagEditorRootElem.addClass('tag-editor-show');
    this.tagEditorRootElem.removeClass('tag-editor-hide');
    this.tagCreateInput.focus();
  }

  hide() {
    this.tagEditorRootElem.addClass('tag-editor-hide');
    this.tagEditorRootElem.removeClass('tag-editor-show');
  }

  loadReviewItemSelection(reviewItemViewModel) {
    this.deselectAllTags();

    reviewItemViewModel.tags.forEach(tagViewModel => {
      this.tagPickMap[tagViewModel.tagId].setSelection(true);
    });

    this.sortTagOptions();
  }

  loadTagOptions(listOfTagViewModels) {
    this.tagPickMap = {};
    this.tagPickList = [];

    var sortedTags = listOfTagViewModels.sort((tag1, tag2) => tag1.tagText.localeCompare(tag2.tagText));
    sortedTags.forEach(tagViewModel => {
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

  sortTagOptions() {
    var sortedPickerList = this.tagPickerListElem.find('.tag-select-option').sort((tagElem1, tagElem2) => {
      var tagId1 = $(tagElem1).attr('data-tag-id');
      var tagId2 = $(tagElem2).attr('data-tag-id');

      var tagPick1 = this.tagPickMap[tagId1];
      var tagPick2 = this.tagPickMap[tagId2];

      var tag1IsSelected = tagPick1.isSelected();
      var tag2IsSelected = tagPick2.isSelected();

      var tag1Text = tagPick1.getTagViewModel().tagText;
      var tag2Text = tagPick2.getTagViewModel().tagText;

      if (tag1IsSelected && !tag2IsSelected) {
        return -1;
      }
      if (tag1IsSelected == tag2IsSelected) {
        return tag1Text.localeCompare(tag2Text);
      }
      if (!tag1IsSelected && tag2IsSelected) {
        return 1;
      }
    });

    $.each(sortedPickerList, (index, row) => {
      this.tagPickerListElem.append(row);
    });
  }

  showSearchTagName(tagText) {
    this.tagPickList.forEach(selectableTagView => {
      var tagViewModel = selectableTagView.getTagViewModel();
      if (this.isSimular(tagViewModel.tagText, tagText)) {
        selectableTagView.show();
      } else {
        selectableTagView.hide();
      }
    });
  }

  /**
   * Checks if a string is simular to another
   * @param {string} text 
   * @param {string} substring 
   */
  isSimular(text, searchString) {
    if (text.indexOf(searchString) >= 0) {
      return true;
    }
    return false;
  }

  deselectAllTags() {
    this.tagPickList.forEach(selectableTagView => {
      selectableTagView.setSelection(false);
    });
  }

  showAllTags() {
    this.tagPickList.forEach(selectableTagView => {
      selectableTagView.show();
    });
  }

  bindTagSelectionChanged(handler) {
    this.eventTagSelectionChanged.addEventListener(handler);
  }

  bindNewTagCreated(handler) {
    this.eventTagCreated.addEventListener(handler);
  }

  bindTagDeleted(handler) {
    this.eventTagDeleted.addEventListener(handler);
  }
  
  bindTagUpdated(handler){
    this.eventTagUpdated.addEventListener(handler);
  }
}