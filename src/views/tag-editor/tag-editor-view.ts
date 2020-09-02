class TagEditorView {
  private readonly html = `
    <div id="tag-editor">
      <div id="tag-edit-form"></div>
      <div id="tag-create-form"></div>
      <div id="tag-picker-list"></div>
    </div>
  `;

  private tagEditorRootElem: JQuery<HTMLElement>;
  private tagEditView: TagEditView;
  private tagCreateView: TagCreateView;
  private tagPickerListView: TagPickerListView;

  private readonly eventTagCreated = new EventEmitter();

  /**
   * Creates a tag editor view
   * @param {string} el Selector of the element to replace
   * @param {any} options Options for this tag editor
   */
  constructor(el: string, options = null) {
    // Configure the UI for the definition page
    var rootElement = $(this.html);
    $(el).replaceWith(rootElement);

    this.tagEditorRootElem = rootElement;

    this.tagEditView = new TagEditView('#tag-edit-form');
    this.tagCreateView = new TagCreateView('#tag-create-form');
    this.tagPickerListView = new TagPickerListView('#tag-picker-list');
    this.hide();
    this.showCreatePickMode();


    //Text changed, show relevant simular tags
    this.tagCreateView.bindTagTextInput((inputText) => {
      this.tagPickerListView.showSearchTagName(inputText);
    });

    //Create form submits new tag
    this.tagCreateView.bindNewTagCreated((newTag) => {
      this.tagPickerListView.showSearchTagName('');
    });

    //Tag picked to be edited
    this.tagPickerListView.bindTagEditClicked((editedTag) => {
      this.showEditMode(editedTag);
    });

    //Tag edit cancelled
    this.tagEditView.bindTagEditCancelled(() => {
      this.showCreatePickMode();
    });

    //Tag edit delete tag
    this.tagEditView.bindTagDeleted((deletedTag) => {
      this.showCreatePickMode();
    });

    //Tag edit update
    this.tagEditView.bindTagUpdated((updatedTag) => {
      this.showCreatePickMode();
    });

    //Add duplicate validation provider
    this.tagEditView.addTagDuplicateValidator((tagText) => {
      return this.tagPickerListView.hasTagByText(tagText);
    });

    //Dropdown loses focus, hide
    $(document).on('mouseup', (e) => {
      if (!this.isViewVisible()) {
        return;
      }

      var position = this.tagEditorRootElem.position();
      var xPos = position.left;
      var yPos = position.top;
      var width = this.tagEditorRootElem.outerWidth();
      var height = this.tagEditorRootElem.outerHeight();

      var mouseX = e.pageX;
      var mouseY = e.pageY;

      // Outside div click
      if (mouseX < xPos || mouseX > xPos + width || mouseY < yPos || mouseY > yPos + height) {
        this.hide();
      }
    });
  }

  toggleEditorView(xPos: number, yPos: number): void {
    var isVisible = this.isViewVisible();
    if (isVisible) {
      this.hide();
    } else {
      this.show(xPos, yPos);
    }
  }

  isViewVisible(): boolean {
    return this.tagEditorRootElem.hasClass('tag-editor-show');
  }

  show(xPos: number, yPos: number): void {
    xPos = xPos == null ? 0 : xPos;
    yPos = yPos == null ? 0 : yPos;

    this.tagEditorRootElem.css('left', xPos);
    this.tagEditorRootElem.css('top', yPos);

    this.showCreatePickMode();

    this.tagEditorRootElem.addClass('tag-editor-show');
    this.tagEditorRootElem.removeClass('tag-editor-hide');
  }

  hide(): void {
    this.tagEditorRootElem.addClass('tag-editor-hide');
    this.tagEditorRootElem.removeClass('tag-editor-show');
  }

  loadTagOptions(listOfTags: Array<TagViewModel>): void {
    this.tagPickerListView.loadTagOptions(listOfTags);
  }

  addTagPickOption(tagOption: TagViewModel): void {
    this.tagPickerListView.addTagPickOption(tagOption);
  }

  loadReviewItemSelection(reviewItem: ReviewItemViewModel): void {
    this.tagPickerListView.loadReviewItemSelection(reviewItem);
  }

  showCreatePickMode(): void {
    this.tagEditView.hide();
    this.tagCreateView.show();
    this.tagPickerListView.show();
  }

  showEditMode(tagToEdit: TagViewModel): void {
    this.tagPickerListView.hide();
    this.tagCreateView.hide();
    this.tagEditView.show(tagToEdit);
  }

  bindTagSelectionChanged(handler: (selectedTag: TagViewModel, isSelected: boolean) => void): void {
    this.tagPickerListView.bindTagSelectionChanged(handler);
  }

  bindNewTagCreated(handler: (newTag: TagViewModel) => void): void {
    this.tagCreateView.bindNewTagCreated(handler);
  }

  bindTagDeleted(handler: (deletedTag: TagViewModel) => void): void {
    this.tagEditView.bindTagDeleted(handler);
  }

  bindTagUpdated(handler: (updatedTag: TagViewModel) => void): void {
    this.tagEditView.bindTagUpdated(handler);
  }
}