class TagPickerListView {
  html = `
    <div id="tag-picker-list"></div>
  `;
  newPickableTagHtml = `
    <div></div>
  `;

  tagPickerListView;

  tagPickMap = {};
  tagPickList = [];

  eventTagSelectionChanged = new EventEmitter();
  eventTagEditClicked = new EventEmitter();

  constructor(el, options) {
    var rootElement = $(this.html);
    $(el).replaceWith(rootElement);

    this.tagPickerListView = rootElement;
  }

  loadReviewItemSelection(reviewItemViewModel) {
    this.deselectAllTags();

    reviewItemViewModel.tags.forEach(tagViewModel => {
      this.tagPickMap[tagViewModel.tagId].setSelection(true);
    });

    this.sortTagOptions();
  }

  loadTagOptions(listOfTagViewModels) {
    this.tagPickMap = {};
    this.tagPickList = [];

    var sortedTags = listOfTagViewModels.sort((tag1, tag2) => tag1.tagText.localeCompare(tag2.tagText));
    sortedTags.forEach(tagViewModel => {
      this.addTagPickOption(tagViewModel);
    });
  }

  addTagPickOption(tagViewModel) {
    // Create dom to attach to
    var newTagPickOption = $(this.newPickableTagHtml);
    var newTagPickId = `tag-option-${tagViewModel.tagId}`;
    newTagPickOption.attr('id', newTagPickId);
    this.tagPickerListView.append(newTagPickOption);

    // Create tag picker option
    var tagPickOption = new SelectableTagView(`#${newTagPickId}`, tagViewModel);
    tagPickOption.bindTagSelectChanged((tagViewModel, isSelected) => {
      this.eventTagSelectionChanged.emit(tagViewModel, isSelected);
    });
    tagPickOption.bindTagEditClicked(() => {
      //TODO
    });

    this.tagPickMap[tagViewModel.tagId] = tagPickOption;
    this.tagPickList.push(tagPickOption);
  }

  sortTagOptions() {
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

  showSearchTagName(tagText) {
    if (StringUtil.isNullOrEmpty(tagText)) {
      this.showAllTags();
    }

    //Show selected tags
    this.tagPickList.forEach(selectableTagView => {
      var tagViewModel = selectableTagView.getTagViewModel();
      if (this.isSimular(tagViewModel.tagText, tagText)) {
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
  isSimular(text, searchString) {
    if (text.indexOf(searchString) >= 0) {
      return true;
    }
    return false;
  }

  deselectAllTags() {
    this.tagPickList.forEach(selectableTagView => {
      selectableTagView.setSelection(false);
    });
  }

  showAllTags() {
    this.tagPickList.forEach(selectableTagView => {
      selectableTagView.show();
    });
  }

  bindTagSelectionChanged(handler) {
    this.eventTagSelectionChanged.addEventListener(handler);
  }

  bindTagEditClicked(handler) {
    this.eventTagEditClicked.addEventListener(handler);
  }
}