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
    this.showCreatePickMode();

    this.hide();

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

    this.tagPickerListView.bindTagEditClicked((tagViewModel) => {
      //TODO
    });

    // Dropdown loses focus, hide
    // rootElement.focusout((e) => {
    //   var newFocusedElem = $(':focus');
    //   if (rootElement.has(newFocusedElem).length == 0) {
    //     this.hide();
    //   }
    // });
  }

  newTagEntered(newTagViewModel) {
    this.eventTagCreated.emit(newTagViewModel);
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
  }

  showEditMode(tagViewModel) {
    this.tagEditView.show(tagViewModel);
    this.tagCreateView.hide();
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