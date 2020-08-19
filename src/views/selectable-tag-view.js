class SelectableTagView {

  html = `
    <div class="tag-select-option">
      <div class="tag-select-text">TagText</div>
      <div class="tag-select-edit-btn">✏️</div>
    </div>
  `;

  tagSelectedClass = 'tag-selected';
  tagNotSelectedClass = 'tag-selectable';

  tagElem;

  tagViewModel;

  eventTagEditClicked = new EventEmitter();
  eventTagSelectChanged = new EventEmitter();

  /**
   * Creates a new unselected pickable tag
   * @param {string} el Element selector to replace with
   * @param {TagViewModel} tagViewModel Tag view model to display
   */
  constructor(el, tagViewModel) {
    this.tagViewModel = tagViewModel;

    var rootElement = $(el);
    var newSelectableTag = $(this.html);
    this.tagElem = newSelectableTag;
    rootElement.replaceWith(newSelectableTag);

    newSelectableTag.css('background-color', tagViewModel.tagColor);
    var isSelectedClass = tagViewModel.isSelected ? this.tagSelectedClass : this.tagNotSelectedClass;
    newSelectableTag.addClass(isSelectedClass);

    var tagTextDiv = newSelectableTag.find('.tag-select-text');
    tagTextDiv.text(tagViewModel.tagText);

    // Edit button click
    var tagEditButton = newSelectableTag.find('.tag-select-edit-btn');
    tagEditButton.on('click', () => this.eventTagEditClicked.emit());

    // Tag Clicked
    newSelectableTag.on('click', () => {
      this.toggleSelection();
    });
  }

  isSelected() {
    return this.tagElem.hasClass(this.tagSelectedClass);
  }

  /**
   * Toggles the current selection on/off
   * Emits Tag select changed event
   */
  toggleSelection() {
    var previousIsSelected = this.isSelected();

    var isSelected = this.isSelected();
    isSelected = !isSelected;
    this.setSelection(isSelected);

    //Emit event only if changed from last time and user clicked
    if (isSelected != previousIsSelected) {
      this.eventTagSelectChanged.emit(this.tagViewModel, isSelected);
    }
  }

  /**
   * Sets this view's selection status
   * Does not trigger selection changed event
   * @param {boolean} isSelected 
   */
  setSelection(isSelected) {
    if (isSelected) {
      this.showSelected();
    }
    else {
      this.showNotSelected();
    }
  }

  showSelected() {
    this.tagElem.removeClass(this.tagNotSelectedClass);
    this.tagElem.addClass(this.tagSelectedClass);
  }

  showNotSelected() {
    this.tagElem.removeClass(this.tagSelectedClass);
    this.tagElem.addClass(this.tagNotSelectedClass);
  }

  /**
   * Bind event when the tag selection changed
   * @param {function} handler Calls back with (tagId, bool isSelected)
   */
  bindTagSelectChanged(handler) {
    this.eventTagSelectChanged.addEventListener(handler);
  }

  bindTagEditClicked(handler) {
    this.eventTagEditClicked.addEventListener(handler);
  }
}