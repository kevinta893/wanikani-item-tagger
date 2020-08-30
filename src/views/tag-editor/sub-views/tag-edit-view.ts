class TagEditView {
  private readonly html = `
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

  private tagEditForm;
  private tagEditInput;
  private tagEditInputValidationMessage;
  private tagEditCancelBtn;
  private tagEditDeleteBtn;
  private tagEditSubmitBtn;
  private tagEditColorPicker;

  private tag;

  private readonly eventTagUpdated = new EventEmitter();
  private readonly eventTagDeleted = new EventEmitter();
  private readonly eventTagEditCancelled = new EventEmitter();
  private readonly eventTagTextInput = new EventEmitter();

  private isTagDuplicate: ((tagText: string) => boolean) = (tagText) => false;

  /**
   * Creates a tag editor view
   * @param {string} el Selector of the element to replace
   * @param {any} options Options for this tag editor
   */
  constructor(el: string, options = null) {
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
      this.validateTag()
    });

    //Trim text input
    this.tagEditInput.on('change', (e) => {
      var trimmedText = this.tagEditInput.val().trim();
      this.tagEditInput.val(trimmedText);
    });

    //Tag text changed
    this.tagEditInput.on('input', (e) => {
      this.validateTag();
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
      this.eventTagDeleted.emit(this.tag);
    });

    //Color picked
    this.tagEditColorPicker.bindColorSelected((hexColor) => {
      this.validateTag();
    });
  }

  validateTag(): boolean {
    var tagText = this.tagEditInput.val();

    //Tag text is empty
    if (tagText.length <= 0) {
      this.showValidationError('Tag text cannot be empty');
      this.disableEditButton();
      return false;
    }

    //Tag text and color is the same as the original
    var selectedColor = this.tagEditColorPicker.getSelectedColor();
    if (tagText == this.tag.tagText && selectedColor == this.tag.tagColor) {
      this.clearValidationError();
      this.disableEditButton();
      return false;
    }

    //Tag duplicated with another
    if (tagText != this.tag.tagText && this.isTagDuplicate(tagText)) {
      this.showValidationError('Tag already exists');
      this.disableEditButton();
      return false;
    }

    this.clearValidationError();
    this.enableEditButton();
    return true;
  }

  tagUpdated(): void {
    var newTagText = this.tagEditInput.val();
    if (newTagText.length <= 0) {
      return;
    }

    this.tagEditInput.val('');
    this.tagEditSubmitBtn.prop('disabled', true);

    var currentTagModel = this.tag;
    var updatedTag = new TagViewModel();
    Object.assign(updatedTag, currentTagModel);

    updatedTag.tagText = newTagText;
    updatedTag.tagColor = this.tagEditColorPicker.getSelectedColor();

    this.eventTagUpdated.emit(updatedTag);
  };

  show(tag: TagViewModel): void {
    this.tag = tag;
    this.tagEditInput.val(tag.tagText);
    this.tagEditInput.attr('placeholder', tag.tagText);
    this.tagEditColorPicker.setSelectedColor(tag.tagColor);

    this.clearValidationError();

    this.tagEditForm.show();
    this.tagEditInput.focus();
  }

  hide(): void {
    this.tagEditForm.hide();
  }

  showValidationError(errorMessage: string): void {
    this.tagEditInputValidationMessage.text(errorMessage);
    this.tagEditInputValidationMessage.show();
    this.tagEditInput.addClass('tag-edit-input-invalid');
  }

  clearValidationError(): void {
    this.tagEditInput.removeClass('tag-edit-input-invalid');
    this.tagEditInputValidationMessage.hide();
  }

  disableEditButton(): void {
    this.tagEditSubmitBtn.prop('disabled', true);
  }

  enableEditButton(): void {
    this.tagEditSubmitBtn.prop('disabled', false);
  }

  /**
   * Provide a function to check if a tag is duplicated
   * @param {Func<string,bool>} duplicateValidator A function that checks
   * if the provided tag text is duplicate or not. Returns true if duplicate,
   * false otherwise
   */
  addTagDuplicateValidator(duplicateValidator: ((tagText: string) => boolean)): void {
    this.isTagDuplicate = duplicateValidator;
  }

  bindTagEditCancelled(handler: () => void): void {
    this.eventTagEditCancelled.addEventListener(handler);
  }

  bindTagDeleted(handler: (deletedTag: TagViewModel) => void): void {
    this.eventTagDeleted.addEventListener(handler);
  }

  bindTagUpdated(handler: (updatedTag: TagViewModel) => void): void {
    this.eventTagUpdated.addEventListener(handler);
  }

  bindTagTextInput(handler: (tagText: string) => void): void {
    this.eventTagTextInput.addEventListener(handler);
  }
}