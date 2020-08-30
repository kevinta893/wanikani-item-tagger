class TagCreateView {
  private readonly html = `
    <div id="tag-create-form">
      <div id="tag-create-color-picker"></div>
      <input id="tag-create-input" type="text" autocaptialize="none" autocomplete="off" spellcheck="on" autocorrect="false" maxlength="${Constants.MAX_TAG_TEXT_LENGTH}"/>
      <button id="tag-create-input-submit" class="tag-ui-add-btn" disabled>Add Tag</button>
    </div>
  `;

  private tagEditorRootElem;
  private tagCreateForm;
  private tagCreateInput;
  private tagCreateSubmitBtn;
  private tagCreateColorPicker

  private readonly eventNewTagCreated = new EventEmitter();
  private readonly eventTagTextInput = new EventEmitter();

  /**
   * Creates a tag editor view
   * @param {string} el Selector of the element to replace
   * @param {object} options Options for this tag editor
   */
  constructor(el: string, options = null) {
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

  disableCreateButton(): void {
    this.tagCreateSubmitBtn.prop('disabled', true);
  }

  enableCreateButton(): void {
    this.tagCreateSubmitBtn.prop('disabled', false);
  }

  newTagEntered(): void {
    var newTagText = this.tagCreateInput.val();
    if (newTagText.length <= 0) {
      return;
    }

    this.tagCreateInput.val('');
    this.tagCreateSubmitBtn.prop('disabled', true);

    var newTag = new TagViewModel();
    newTag.tagText = newTagText;
    newTag.tagColor = this.tagCreateColorPicker.getSelectedColor();

    this.eventNewTagCreated.emit(newTag);
  };

  show(): void {
    this.tagCreateForm.show()
    this.tagCreateInput.focus();
  }

  hide(): void {
    this.tagCreateForm.hide()
  }

  bindTagTextInput(handler: (tagText: string) => void): void {
    this.eventTagTextInput.addEventListener(handler);
  }

  bindNewTagCreated(handler: (newTag: TagViewModel) => void): void {
    this.eventNewTagCreated.addEventListener(handler);
  }
}