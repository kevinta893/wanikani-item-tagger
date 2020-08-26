class TagEditorView {
  html = `
    <div id="tag-editor">
      <div id="tag-edit-form"></div>
      <div id="tag-create-form"></div>
      <div id="tag-picker-list"></div>
    </div>
  `;

  tagEditorRootElem;
  tagEditView;
  tagCreateView;
  tagPickerListView;

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

    this.tagEditorRootElem = rootElement;

    this.tagEditView = new TagEditView('#tag-edit-form');
    this.tagCreateView = new TagCreateView('#tag-create-form');
    this.tagPickerListView = new TagPickerListView('#tag-picker-list');
    this.hide();
    this.showCreatePickMode();


    //Text changed, show relevant simular tags
    this.tagCreateView.bindTagTextInput((inputText) => {
      var hasTag = this.tagPickerListView.hasTagByText(inputText);
      if (hasTag) {
        this.tagCreateView.disableCreateButton();
      }
      this.tagPickerListView.showSearchTagName(inputText);
    });

    //Create form submits new tag
    this.tagCreateView.bindTagCreated((newTagViewModel) => {
      this.tagPickerListView.showSearchTagName('');
      this.newTagEntered(newTagViewModel);
    });

    //Tag selection changed
    this.tagPickerListView.bindTagSelectionChanged((tagViewModel, isSelected) => {
      this.eventTagSelectionChanged.emit(tagViewModel, isSelected);
    });

    //Tag picked to be edited
    this.tagPickerListView.bindTagEditClicked((tagViewModel) => {
      this.showEditMode(tagViewModel);
    });

    //Tag edit cancelled
    this.tagEditView.bindTagEditCancelled(() => {
      this.showCreatePickMode();
    });

    //Tag edit delete tag
    this.tagEditView.bindTagEditCancelled((tagViewModel) => {
      this.eventTagDeleted.emit(tagViewModel);
    });

    //Tag edit update
    this.tagEditView.bindTagUpdated((updatedTagViewModel) => {
      this.eventTagUpdated.emit(updatedTagViewModel);
      this.showCreatePickMode();
    });

    //Tag edit text updated
    this.tagEditView.bindTagTextInput((inputText) => {
      var hasTag = this.tagPickerListView.hasTagByText(inputText);
      if (hasTag) {
        this.tagEditView.showValidationErrorTagExists();
      }
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

  newTagEntered(newTagViewModel) {
    this.eventTagCreated.emit(newTagViewModel);
  };

  toggleEditorView(xPos, yPos) {
    var isVisible = this.isViewVisible();
    if (isVisible) {
      this.hide();
    } else {
      this.show(xPos, yPos);
    }
  }

  isViewVisible() {
    return this.tagEditorRootElem.hasClass('tag-editor-show');
  }

  show(xPos, yPos) {
    xPos = xPos == null ? 0 : xPos;
    yPos = yPos == null ? 0 : yPos;

    this.tagEditorRootElem.css('left', xPos);
    this.tagEditorRootElem.css('top', yPos);

    this.showCreatePickMode();

    this.tagEditorRootElem.addClass('tag-editor-show');
    this.tagEditorRootElem.removeClass('tag-editor-hide');
  }

  hide() {
    this.tagEditorRootElem.addClass('tag-editor-hide');
    this.tagEditorRootElem.removeClass('tag-editor-show');
  }

  loadTagOptions(listOfTagViewModels) {
    this.tagPickerListView.loadTagOptions(listOfTagViewModels);
  }

  addTagPickOption(tagViewModel) {
    this.tagPickerListView.addTagPickOption(tagViewModel);
  }

  loadReviewItemSelection(reviewItemViewModel) {
    this.tagPickerListView.loadReviewItemSelection(reviewItemViewModel);
  }

  showCreatePickMode() {
    this.tagEditView.hide();
    this.tagCreateView.show();
    this.tagPickerListView.show();
  }

  showEditMode(tagViewModel) {
    this.tagPickerListView.hide();
    this.tagCreateView.hide();
    this.tagEditView.show(tagViewModel);
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

  bindTagUpdated(handler) {
    this.eventTagUpdated.addEventListener(handler);
  }
}