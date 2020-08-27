class TagEditView {
  html = `
    <div id="tag-edit-form">
      <div id="tag-edit-color-picker"></div>
      <div class="tag-edit-input-group">
        <input id="tag-edit-input" type="text" autocaptialize="none" autocomplete="off" spellcheck="on" autocorrect="false" maxlength="${Constants.MAX_TAG_TEXT_LENGTH}"/>
        <div id="tag-edit-input-validation"></div>
      </div>
      <button id="tag-edit-input-submit" class="tag-ui-add-btn" disabled>Update</button>
      <button id="tag-edit-cancel" class="tag-edit-dialog-btn">Cancel</button>
      <button id="tag-edit-delete" class="tag-edit-dialog-btn">Delete Tag</button>
    </div>
  `;

  tagEditForm;
  tagEditInput;
  tagEditInputValidationMessage;
  tagEditCancelBtn;
  tagEditDeleteBtn;
  tagEditSubmitBtn;
  tagEditColorPicker;

  tagViewModel;

  eventTagUpdated = new EventEmitter();
  eventTagDeleted = new EventEmitter();
  eventTagEditCancelled = new EventEmitter();
  eventTagTextInput = new EventEmitter();

  isTagDuplicate = () => false;

  /**
   * Creates a tag editor view
   * @param {string} el Selector of the element to replace
   * @param {object} options Options for this tag editor
   */
  constructor(el, options) {
    // Configure the UI for the definition page
    var rootElement = $(this.html);
    $(el).replaceWith(rootElement);

    this.tagEditForm = $('#tag-edit-form');
    this.tagEditInput = $('#tag-edit-input');
    this.tagEditInputValidationMessage = $('#tag-edit-input-validation');
    this.tagEditCancelBtn = $('#tag-edit-cancel');
    this.tagEditDeleteBtn = $('#tag-edit-delete');
    this.tagEditSubmitBtn = $('#tag-edit-input-submit');
    this.tagEditColorPicker = new TagColorPickerView('#tag-edit-color-picker');

    //Disable tag enter button when text empty
    this.tagEditInput.on('input', (e) => {
      this.validateTagText()
    });

    //Trim text input
    this.tagEditInput.on('change', (e) => {
      var trimmedText = this.tagEditInput.val().trim();
      this.tagEditInput.val(trimmedText);
    });

    //Tag text changed
    this.tagEditInput.on('input', (e) => {
      this.validateTagText();
    });

    //Enter button used to submit
    this.tagEditSubmitBtn.on('click', (e) => this.tagUpdated());
    this.tagEditInput.on('keyup', (e) => {
      if (e.which == 13) {
        this.tagUpdated();
      }
    });

    //Cancel clicked
    this.tagEditCancelBtn.on('click', (e) => {
      this.eventTagEditCancelled.emit();
    });

    //Delete clicked
    this.tagEditDeleteBtn.on('click', (e) => {
      this.eventTagDeleted.emit(this.tagViewModel);
    });
  }

  validateTagText() {
    var tagText = this.tagEditInput.val();

    //Tag text is empty
    if (tagText.length <= 0) {
      this.showValidationError('Tag text cannot be empty');
      this.disableEditButton();
      return false;
    }

    //Tag text is the same as the original
    if (tagText == this.tagViewModel.tagText) {
      this.clearValidationError();
      this.disableEditButton();
      return false;
    }

    if (this.isTagDuplicate(tagText)) {
      this.showValidationError('Tag already exists');
      this.disableEditButton();
      return false;
    }

    this.clearValidationError();
    this.enableEditButton();
    return true;
  }

  tagUpdated() {
    var newTagText = this.tagEditInput.val();
    if (newTagText.length <= 0) {
      return;
    }

    this.tagEditInput.val('');
    this.tagEditSubmitBtn.prop('disabled', true);

    var currentTagModel = this.tagViewModel;
    var updatedTagViewModel = new TagViewModel();
    Object.assign(updatedTagViewModel, currentTagModel);

    updatedTagViewModel.tagText = newTagText;
    updatedTagViewModel.tagColor = this.tagEditColorPicker.getSelectedColor();

    this.eventTagUpdated.emit(updatedTagViewModel);
  };

  show(tagViewModel) {
    this.tagViewModel = tagViewModel;
    this.tagEditInput.val(tagViewModel.tagText);
    this.tagEditInput.attr('placeholder', tagViewModel.tagText);
    this.tagEditColorPicker.setSelectedColor(tagViewModel.tagColor);

    this.clearValidationError();

    this.tagEditForm.show();
    this.tagEditInput.focus();
  }

  hide() {
    this.tagEditForm.hide();
  }

  showValidationError(errorMessage) {
    this.tagEditInputValidationMessage.text(errorMessage);
    this.tagEditInputValidationMessage.show();
    this.tagEditInput.addClass('tag-edit-input-invalid');
  }

  clearValidationError() {
    this.tagEditInput.removeClass('tag-edit-input-invalid');
    this.tagEditInputValidationMessage.hide();
  }

  disableEditButton() {
    this.tagEditSubmitBtn.prop('disabled', true);
  }

  enableEditButton() {
    this.tagEditSubmitBtn.prop('disabled', false);
  }

  /**
   * Provide a function to check if a tag is duplicated
   * @param {Func<string,bool>} duplicateValidator A function that checks
   * if the provided tag text is duplicate or not. Returns true if duplicate,
   * false otherwise
   */
  addTagDuplicateValidator(duplicateValidator) {
    this.isTagDuplicate = duplicateValidator;
  }

  bindTagEditCancelled(handler) {
    this.eventTagEditCancelled.addEventListener(handler);
  }

  bindTagDeleted(handler) {
    this.eventTagDeleted.addEventListener(handler);
  }

  bindTagUpdated(handler) {
    this.eventTagUpdated.addEventListener(handler);
  }

  bindTagTextInput(handler) {
    this.eventTagTextInput.addEventListener(handler);
  }
}