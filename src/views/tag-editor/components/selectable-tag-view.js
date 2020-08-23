class SelectableTagView {

  html = `
    <div class="tag-select-option">
      <div class="tag-select-text">TagText</div>
      <div class="tag-select-edit-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
          <title>Edit Tag</title>
          <path fill="none" d="M-1-1h1002v1002H-1z"/>
          <g>
            <path stroke="#fff" d="M194.001 647.085l518.777-521.307 162.188 162.188-520.786 517.81-229.146 68.446 68.967-227.137z" stroke-opacity="null" stroke-width="80" fill="none"/>
            <path stroke="#fff" stroke-linecap="null" stroke-linejoin="null" stroke-opacity="null" stroke-width="55" fill="none" d="M584.52 255.816l158.545 158.548"/>
          </g>
        </svg>
      </div>
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
    var tagElem = this.tagElem = $(this.html);
    rootElement.replaceWith(tagElem);

    tagElem.css('background-color', tagViewModel.tagColor);
    tagElem.attr('data-tag-id', tagViewModel.tagId);
    this.setSelection(false);

    var tagTextDiv = tagElem.find('.tag-select-text');
    tagTextDiv.text(tagViewModel.tagText);

    // Edit button click
    var tagEditButton = tagElem.find('.tag-select-edit-btn');
    tagEditButton.on('click', () => {
      this.eventTagEditClicked.emit(this.tagViewModel);
    });

    // Tag Clicked
    tagTextDiv.on('click', () => {
      this.toggleSelection();
    });
  }

  isSelected() {
    return this.tagElem.hasClass(this.tagSelectedClass);
  }

  getTagViewModel() {
    return this.tagViewModel;
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

  show() {
    this.tagElem.show();
  }

  hide() {
    this.tagElem.hide();
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