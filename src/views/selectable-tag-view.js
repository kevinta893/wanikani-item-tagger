class SelectableTagView {

  html = `
    <div class="tag-select-option">
      <div class="tag-select-text">TagText</div>
      <div class="tag-select-edit-btn">✏️</div>
    </div>
  `;
  static css = `    
    .tag-select-option {
      cursor: pointer;
      display: inline-block;
      padding-left: 0.5em;
      padding-right: 0.5em;
      margin-right: 0.5em;
      margin-bottom: 0.5em;
      color: #eee;
      -webkit-border-radius: 3px;
      -moz-border-radius: 3px;
      border-radius: 3px;
    }
    .tag-select-text {
      display: inline-block;
    }
    .tag-select-edit-btn {
      display: inline-block;
    }
    .tag-select-edit-btn:hover{
    }
    .tag-selected {
    }
    .tag-selectable {
      filter: opacity(60%);
    }
  `;

  tagSelectedClass = 'tag-selected';
  tagNotSelectedClass = 'tag-selectable';

  tagElem;

  tagId;

  eventTagEditClicked = new EventEmitter();
  eventTagSelectChanged = new EventEmitter();

  /**
   * Creates a new unselected pickable tag
   * @param {string} el Element selector to replace with
   * @param {TagViewModel} tagViewModel Tag view model to display
   */
  constructor(el, tagViewModel) {
    GM_addStyle(this.css);

    this.tagId = tagViewModel.tagId;

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

  toggleSelection() {
    var isSelected = this.isSelected();
    isSelected = !isSelected;
    this.setSelection(isSelected);
  }

  setSelection(isSelected) {
    var previousIsSelected = this.isSelected();

    if (isSelected) {
      this.showSelected();
    }
    else {
      this.showNotSelected();
    }

    if (isSelected != previousIsSelected){
      this.eventTagSelectChanged.emit(this.tagId, isSelected);
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