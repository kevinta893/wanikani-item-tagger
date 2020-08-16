class TagEditorView {
  html = `
    <div>
      <div>
        <div id="tag-color-picker"></div>
        <input id="tag-ui-input" type="text" autocaptialize="none" autocomplete="on" spellcheck="off" autocorrect="false" maxlength="${Constants.MAX_TAG_TEXT_LENGTH}">
        <button id="tag-ui-input-submit" class="tag-ui-add-btn"></button>
      </div>
      <div>
        <div id="tag-picker-list">
      </div>
    </div>
  `;
  newPickableTagHtml = `
    <div></div>
  `;
  css = `
    #tag-picker-list {

    }
  `;

  tagPickerListElem;

  /**
   * Creates a tag editor view
   * @param {string} el Selector of the element to replace
   * @param {object} options Options for this tag editor
   */
  constructor(el, options) {
    GM_addStyle(this.css);
    GM_addStyle(SelectableTagView.css);

    // Configure the UI for the definition page
    var rootElement = $(el);
    rootElement.replaceWith(this.html);

    this.tagPickerListElem = $('#tag-picker-list');
  }

  loadTagOptions(listOfTagViewModels) {
    listOfTagViewModels.forEach(tagViewModel => {
      this.addTagPickOption(tagViewModel);
    });
  }

  addTagPickOption(tagViewModel) {
    // Create dom to attach to
    var newTagPickOption = $(this.newPickableTagHtml);
    var newTagPickId = `tag-option-${tagViewModel.tagId}`;
    newTagPickOption.attr('id', newTagPickId);
    this.tagPickerListElem.append(newTagPickOption);

    // Create tag picker option
    var tagPickOption = new SelectableTagView(`#${newTagPickId}`, tagViewModel);
    tagPickOption.bindTagSelectChanged(() => { });
    tagPickOption.bindTagEditClicked(() => { });
  }

}