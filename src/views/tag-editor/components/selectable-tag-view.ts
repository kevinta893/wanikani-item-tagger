class SelectableTagView {

  private readonly html = `
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

  private readonly tagSelectedClass = 'tag-selected';
  private readonly tagNotSelectedClass = 'tag-selectable';

  private readonly eventTagEditClicked = new EventEmitter();
  private readonly eventTagSelectChanged = new EventEmitter();

  private tagElem;

  private tag: TagViewModel;

  
  /**
   * Creates a new unselected pickable tag
   * @param {string} el Element selector to replace with
   * @param {TagViewModel} tag Tag view model to display
   */
  constructor(el: string, tag: TagViewModel) {
    this.tag = tag;

    var rootElement = $(el);
    var tagElem = this.tagElem = $(this.html);
    rootElement.replaceWith(tagElem);

    tagElem.css('background-color', tag.tagColor);
    tagElem.attr('data-tag-id', tag.tagId);
    this.setSelection(false);

    var tagTextDiv = tagElem.find('.tag-select-text');
    tagTextDiv.text(tag.tagText);

    // Edit button click
    var tagEditButton = tagElem.find('.tag-select-edit-btn');
    tagEditButton.on('click', () => {
      this.eventTagEditClicked.emit(this.tag);
    });

    // Tag Clicked
    tagTextDiv.on('click', () => {
      this.toggleSelection();
    });
  }

  isSelected(): boolean {
    return this.tagElem.hasClass(this.tagSelectedClass);
  }

  getTagViewModel(): TagViewModel {
    return this.tag;
  }

  /**
   * Toggles the current selection on/off
   * Emits Tag select changed event
   */
  toggleSelection(): void {
    var previousIsSelected = this.isSelected();

    var isSelected = this.isSelected();
    isSelected = !isSelected;
    this.setSelection(isSelected);

    //Emit event only if changed from last time and user clicked
    if (isSelected != previousIsSelected) {
      this.eventTagSelectChanged.emit(this.tag, isSelected);
    }
  }

  /**
   * Sets this view's selection status
   * Does not trigger selection changed event
   * @param {boolean} isSelected 
   */
  setSelection(isSelected: boolean): void {
    if (isSelected) {
      this.showSelected();
    }
    else {
      this.showNotSelected();
    }
  }

  showSelected(): void {
    this.tagElem.removeClass(this.tagNotSelectedClass);
    this.tagElem.addClass(this.tagSelectedClass);
  }

  showNotSelected(): void {
    this.tagElem.removeClass(this.tagSelectedClass);
    this.tagElem.addClass(this.tagNotSelectedClass);
  }

  show(): void {
    this.tagElem.show();
  }

  hide(): void {
    this.tagElem.hide();
  }

  /**
   * Bind event when the tag selection changed
   * @param {function} handler Calls back with (tagId, bool isSelected)
   */
  bindTagSelectChanged(handler: (selectedTag: TagViewModel, isSelected: boolean) => void): void {
    this.eventTagSelectChanged.addEventListener(handler);
  }

  bindTagEditClicked(handler: (updatedTag: TagViewModel) => void): void {
    this.eventTagEditClicked.addEventListener(handler);
  }
}