class TagEditView {
  html = `
    <div id="tag-edit-form">
      <div id="tag-edit-color-picker"></div>
      <input id="tag-edit-input" type="text" autocaptialize="none" autocomplete="off" spellcheck="on" autocorrect="false" maxlength="${Constants.MAX_TAG_TEXT_LENGTH}">
      <button id="tag-edit-input-submit" class="tag-ui-add-btn" disabled>Update</button>
      <button id="tag-edit-cancel" class="tag-edit-dialog-btn">Cancel</button>
      <button id="tag-edit-delete" class="tag-edit-dialog-btn">Delete Tag</button>
    </div>
  `;

  tagEditForm;
  tagEditInput;
  tagEditCancelBtn;
  tagEditDeleteBtn;
  tagEditSubmitBtn;
  tagEditColorPicker;

  tagViewModel;

  eventTagUpdated = new EventEmitter();
  eventTagDeleted = new EventEmitter();
  eventTagEditCancelled = new EventEmitter();
  eventTagTextInput = new EventEmitter();

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
    this.tagEditCancelBtn = $('#tag-edit-cancel');
    this.tagEditDeleteBtn = $('#tag-edit-delete');
    this.tagEditSubmitBtn = $('#tag-edit-input-submit');
    this.tagEditColorPicker = new TagColorPickerView('#tag-edit-color-picker');

    //Disable tag enter button when text empty
    this.tagEditInput.on('input', (e) => {
      var inputText = this.tagEditInput.val();
      if (inputText.length <= 0) {
        this.disableEditButton();
      } else {
        this.enableEditButton();
      }
    });

    //Trim text input
    this.tagEditInput.on('change', (e) => {
      var trimmedText = this.tagEditInput.val().trim();
      this.tagEditInput.val(trimmedText);
    });

    //Tag text changed
    this.tagEditInput.on('input', (e) => {
      var inputText = this.tagEditInput.val();
      this.eventTagTextInput.emit(inputText);
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

  tagUpdated() {
    var newTagText = this.tagEditInput.val();
    if (newTagText.length <= 0) {
      return;
    }

    this.tagEditInput.val('');
    this.tagEditSubmitBtn.prop('disabled', true);

    var updatedTagViewModel = this.tagViewModel;
    updatedTagViewModel.tagText = newTagText;
    updatedTagViewModel.tagColor = this.tagEditColorPicker.getSelectedColor();

    this.eventTagUpdated.emit(updatedTagViewModel);
  };

  show(tagViewModel) {
    this.tagViewModel = tagViewModel;
    this.tagEditInput.val(tagViewModel.tagText);
    this.tagEditInput.attr('placeholder', tagViewModel.tagText);
    this.tagEditColorPicker.setSelectedColor(tagViewModel.tagColor);

    this.tagEditForm.show();
    this.tagEditInput.focus();
  }

  hide() {
    this.tagEditForm.hide();
  }

  loadTagToEdit(tagViewModel) {
    this.tagViewModel = tagViewModel;
    this.tagEditInput.val(tagViewModel.tagText);
  }

  showValidationErrorTagExists() {
    this.tagEditSubmitBtn.attr('title', 'This tag already exists!');
    this.disableEditButton();
  }

  removeValidationErrorTagExists() {
    this.tagEditSubmitBtn.removeAttr('title');
    this.enableEditButton();
  }

  disableEditButton() {
    this.tagEditSubmitBtn.prop('disabled', true);
  }

  enableEditButton() {
    this.tagEditSubmitBtn.prop('disabled', false);
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