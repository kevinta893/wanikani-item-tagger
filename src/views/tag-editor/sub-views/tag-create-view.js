class TagCreateView {
  html = `
    <div id="tag-create-form">
      <div id="tag-create-color-picker"></div>
      <input id="tag-create-input" type="text" autocaptialize="none" autocomplete="off" spellcheck="on" autocorrect="false" maxlength="${Constants.MAX_TAG_TEXT_LENGTH}">
      <button id="tag-create-input-submit" class="tag-ui-add-btn" disabled>AddTag</button>
    </div>
  `;

  tagCreateForm;
  tagCreateInput;
  tagCreateSubmitBtn;
  tagCreateColorPicker

  eventTagCreated = new EventEmitter();
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

    this.tagEditorRootElem = $('#tag-editor');

    this.tagCreateForm = $('#tag-create-form');
    this.tagCreateInput = $('#tag-create-input');
    this.tagCreateSubmitBtn = $('#tag-create-input-submit');
    this.tagCreateColorPicker = new TagColorPickerView('#tag-create-color-picker');

    //Disable tag enter button when text empty
    this.tagCreateInput.on('input', (e) => {
      var inputText = this.tagCreateInput.val();
      if (inputText.length <= 0) {
        this.disableCreateButton();
      } else {
        this.enableCreateButton();
      }
    });

    //Text changed, show relevant simular tags
    this.tagCreateInput.on('input', (e) => {
      var inputText = this.tagCreateInput.val();
      this.eventTagTextInput.emit(inputText);
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
  }

  disableCreateButton() {
    this.tagCreateSubmitBtn.prop('disabled', true);
  }

  enableCreateButton() {
    this.tagCreateSubmitBtn.prop('disabled', false);
  }

  newTagEntered() {
    var newTagText = this.tagCreateInput.val();
    if (newTagText.length <= 0) {
      return;
    }

    this.tagCreateInput.val('');
    this.tagCreateSubmitBtn.prop('disabled', true);

    var newItemModel = new TagViewModel();
    newItemModel.tagText = newTagText;
    newItemModel.tagColor = this.tagCreateColorPicker.getSelectedColor();

    this.eventTagCreated.emit(newItemModel);
  };

  show() {
    this.tagCreateForm.show()
    this.tagCreateInput.focus();
  }

  hide() {
    this.tagCreateForm.hide()
  }

  bindTagTextInput(handler) {
    this.eventTagTextInput.addEventListener(handler);
  }

  bindTagCreated(handler) {
    this.eventTagCreated.addEventListener(handler);
  }
}