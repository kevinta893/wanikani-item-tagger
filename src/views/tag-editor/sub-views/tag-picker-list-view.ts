class TagPickerListView {
  private readonly html = `
    <div id="tag-picker-list"></div>
  `;
  private readonly newPickableTagHtml = `
    <div></div>
  `;

  private tagPickerListView;

  private tags: TagViewModel[] = [];
  private tagPickMap = {};
  private tagPickList: SelectableTagView[] = [];

  private readonly eventTagSelectionChanged = new EventEmitter();
  private readonly eventTagEditClicked = new EventEmitter();

  constructor(el: string, options = null) {
    var rootElement = $(this.html);
    $(el).replaceWith(rootElement);

    this.tagPickerListView = rootElement;
  }

  loadReviewItemSelection(reviewItem): void {
    this.deselectAllTags();

    reviewItem.tags.forEach(tagViewModel => {
      this.tagPickMap[tagViewModel.tagId].setSelection(true);
    });

    this.sortTagOptions();
  }

  loadTagOptions(listOfTags): void {
    this.tags = [];
    this.tagPickMap = {};
    this.tagPickList = [];
    this.removeAllTags();

    var sortedTags = listOfTags.sort((tag1, tag2) => tag1.tagText.localeCompare(tag2.tagText));
    sortedTags.forEach(tagViewModel => {
      this.addTagPickOption(tagViewModel);
    });
  }

  addTagPickOption(tag): void {
    // Create dom to attach to
    var newTagPickOption = $(this.newPickableTagHtml);
    var newTagPickId = `tag-option-${tag.tagId}`;
    newTagPickOption.attr('id', newTagPickId);
    this.tagPickerListView.append(newTagPickOption);

    // Create tag picker option
    var tagPickOption = new SelectableTagView(`#${newTagPickId}`, tag);
    tagPickOption.bindTagSelectChanged((selectedTag, isSelected) => {
      this.eventTagSelectionChanged.emit(selectedTag, isSelected);
    });
    tagPickOption.bindTagEditClicked((editedTag) => {
      this.eventTagEditClicked.emit(editedTag);
    });

    this.tagPickMap[tag.tagId] = tagPickOption;
    this.tagPickList.push(tagPickOption);
    this.tags.push(tag);
  }

  sortTagOptions(): void {
    var sortedPickerList = this.tagPickerListView.find('.tag-select-option').sort((tagElem1, tagElem2) => {
      var tagId1 = $(tagElem1).attr('data-tag-id');
      var tagId2 = $(tagElem2).attr('data-tag-id');

      var tagPick1 = this.tagPickMap[tagId1];
      var tagPick2 = this.tagPickMap[tagId2];

      var tag1IsSelected = tagPick1.isSelected();
      var tag2IsSelected = tagPick2.isSelected();

      var tag1Text = tagPick1.getTagViewModel().tagText;
      var tag2Text = tagPick2.getTagViewModel().tagText;

      if (tag1IsSelected && !tag2IsSelected) {
        return -1;
      }
      if (tag1IsSelected == tag2IsSelected) {
        return tag1Text.localeCompare(tag2Text);
      }
      if (!tag1IsSelected && tag2IsSelected) {
        return 1;
      }
    });

    $.each(sortedPickerList, (index, row) => {
      this.tagPickerListView.append(row);
    });
  }

  showSearchTagName(tagText): void {
    if (StringUtil.isNullOrEmpty(tagText)) {
      this.showAllTags();
    }

    //Show selected tags
    this.tagPickList.forEach(selectableTagView => {
      var selectedTag = selectableTagView.getTagViewModel();
      if (this.isSimular(selectedTag.tagText, tagText)) {
        selectableTagView.show();
      } else {
        selectableTagView.hide();
      }
    });
  }

  /**
   * Checks if a string is simular to another
   * @param {string} text 
   * @param {string} substring 
   */
  isSimular(text, searchString): boolean {
    if (text.indexOf(searchString) >= 0) {
      return true;
    }
    return false;
  }

  deselectAllTags(): void {
    this.tagPickList.forEach(selectableTagView => {
      selectableTagView.setSelection(false);
    });
  }

  removeAllTags(): void {
    this.tagPickerListView.find('.tag-select-option').remove();
  }

  showAllTags(): void {
    this.tagPickList.forEach(selectableTagView => {
      selectableTagView.show();
    });
  }

  hasTagByText(tagText): boolean {
    var existingTag = this.tags.find(existingTag => existingTag.tagText == tagText);
    return existingTag == null ? false : true;
  }

  show(): void {
    this.tagPickerListView.show();
  }

  hide(): void {
    this.tagPickerListView.hide();
  }

  bindTagSelectionChanged(handler: (selectedTag: TagViewModel, isSelected: boolean) => void): void {
    this.eventTagSelectionChanged.addEventListener(handler);
  }

  bindTagEditClicked(handler: (updatedTag: TagViewModel) => void): void {
    this.eventTagEditClicked.addEventListener(handler);
  }
}