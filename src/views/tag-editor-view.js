class TagEditorView {
  html = `
    <div id="tag-editor">
      <div id="tag-editor-form">
        <div id="tag-color-picker"></div>
        <input id="tag-editor-input" type="text" autocaptialize="none" autocomplete="on" spellcheck="off" autocorrect="false" maxlength="${Constants.MAX_TAG_TEXT_LENGTH}">
        <button id="tag-editor-input-submit" class="tag-ui-add-btn" disabled>AddTag</button>
      </div>
      <div id="tag-picker-list"></div>
    </div>
  `;
  newPickableTagHtml = `
    <div></div>
  `;

  rootElement;
  tagEditorFormRoot;
  newTagInput;

  tagPickerListElem;
  tagPickMap = {};
  tagPickList = [];

  eventTagSelectionChanged = new EventEmitter();
  eventNewTagCreated = new EventEmitter();
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

    var tagPickerList = this.tagPickerListElem = $('#tag-picker-list');
    var tagEditorFromRoot = this.tagEditorFormRoot = $('#tag-editor');
    var newTagInput = this.newTagInput = $('#tag-editor-input');
    var addNewTagButton = $('#tag-editor-input-submit');
    var tagColorPicker = this.colorPicker = new TagColorPickerView('#tag-color-picker');

    this.hide();

    //Disable tag enter button when text empty
    newTagInput.on('input', function (e) {
      var inputText = newTagInput.val();
      if (inputText.length <= 0) {
        addNewTagButton.prop('disabled', true);
      } else {
        addNewTagButton.prop('disabled', false);
      }
    });

    //Text changed, show relevant simular tags
    newTagInput.on('input', (e) => {
      var inputText = newTagInput.val();

      if (inputText.length > 0) {
        this.showSearchTagName(inputText);
      } else {
        this.showAllTags();
      }
    });

    //Trim text input
    newTagInput.on('change', (e) => {
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

    // Dropdown loses focus, hide
    // rootElement.focusout((e) => {
    //   var newFocusedElem = $(':focus');
    //   if (rootElement.has(newFocusedElem).length == 0) {
    //     this.hide();
    //   }
    // });
  }

  toggleEditorView() {
    var isVisible = this.isViewVisible();
    if (isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  isViewVisible() {
    return this.tagEditorFormRoot.hasClass('tag-editor-show')
  }

  show() {
    this.tagEditorFormRoot.addClass('tag-editor-show');
    this.tagEditorFormRoot.removeClass('tag-editor-hide');
    this.newTagInput.focus();
  }

  hide() {
    this.tagEditorFormRoot.addClass('tag-editor-hide');
    this.tagEditorFormRoot.removeClass('tag-editor-show');
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
    this.eventNewTagCreated.addEventListener(handler);
  }

  bindTagDeleted(handler) {
    this.eventTagDeleted.addEventListener(handler);
  }
}