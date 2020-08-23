class TagEditView {
  html = `
    <div id="tag-edit-form">
      <div id="tag-edit-color-picker"></div>
      <input id="tag-edit-input" type="text" autocaptialize="none" autocomplete="on" spellcheck="off" autocorrect="false" maxlength="${Constants.MAX_TAG_TEXT_LENGTH}">
      <button id="tag-edit-input-submit" class="tag-ui-add-btn" disabled>AddTag</button>
    </div>
  `;

  tagEditForm;
  tagEditInput;
  tagEditSubmitBtn;
  tagEditColorPicker;

  tagViewModel;

  eventTagUpdated = new EventEmitter();
  eventTagDeleted = new EventEmitter();
  eventTagEditCancelled = new EventEmitter();

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
    this.tagEditSubmitBtn = $('#tag-edit-input-submit');
    this.tagEditColorPicker = new TagColorPickerView('#tag-edit-color-picker');

    //Disable tag enter button when text empty
    this.tagEditInput.on('input', (e) => {
      var inputText = this.tagCreateInput.val();
      if (inputText.length <= 0) {
        this.tagEditSubmitBtn.prop('disabled', true);
      } else {
        this.tagEditSubmitBtn.prop('disabled', false);
      }
    });

    //Trim text input
    this.tagEditInput.on('change', (e) => {
      var trimmedText = this.tagCreateInput.val().trim();
      this.tagCreateInput.val(trimmedText);
    });

    //Enter button used to submit
    this.tagEditSubmitBtn.on('click', (e) => this.tagUpdated());
    this.tagEditInput.on('keyup', (e) => {
      if (e.which == 13) {
        this.tagUpdated();
      }
    });
  }

  tagUpdated() {
    var newTagText = this.tagEditInput.val();
    if (newTagText.length <= 0) {
      return;
    }

    this.tagEditInput.val('');
    this.tagEditSubmitBtn.prop('disabled', true);

    this.eventTagUpdated.emit(newItemModel);
  };

  show() {
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

  bindTagEditCancelled(handler) {
    this.eventTagEditCancelled.addEventListener(handler);
  }

  bindTagDeleted(handler) {
    this.eventTagDeleted.addEventListener(handler);
  }

  bindTagUpdated(handler) {
    this.eventTagUpdated.addEventListener(handler);
  }
}