class TagListView {

  html = `
    <div id="tag-list">
    </div>
  `;
  newTagHtml = `
    <div class="tag"></div>
  `;
  tagListRoot;
  tagList = {};

  reviewItemViewModel;

  /**
   * Creates a tag editor view
   * @param {string} el Selector of the element to replace
   * @param {object} options Options for this tag editor
   */
  constructor(el, options) {
    // Configure the UI for the definition page
    var rootElement = $(el);
    rootElement.replaceWith(this.html);

    var tagListRoot = this.tagListRoot = $('#tag-list');
  }

  show() {
    tagListRoot.show();
  }

  hide() {
    tagListRoot.hide();
  }

  loadReviewItem(reviewItemViewModel) {
    this.reviewItemViewModel = reviewItemViewModel;

    this.removeAllTags();

    reviewItemViewModel.tags.forEach(tagViewModel => {
      this.addTag(tagViewModel);
    });
  }

  addTag(tagViewModel) {
    var newTag = $(this.newTagHtml);
    newTag.attr('data-tag-id', tagViewModel.tagId);
    newTag.css('background-color', tagViewModel.tagColor);
    newTag.data('tag-view-model', tagViewModel);
    newTag.text(tagViewModel.tagText);

    this.tagListRoot.append(newTag);
  }

  removeTag(tagViewModel) {
    this.tagListRoot.find(`.tag[data-tag-id="${tagViewModel.tagId}"]`).get(0).remove();
  }

  removeAllTags() {
    this.tagListRoot.find('.tag').remove();
  }

  getCurrentTags() {
    var currentTags = this.tagListRoot.find('.tag')
      .map((i, tagElem) => $(tagElem).data('tag-view-model'));
    return Array.from(currentTags);
  }

  getCurrentReviewItemViewModel() {
    return this.reviewItemViewModel;
  }


  getCurrentTags() {
    var currentTags = this.tagListRoot.find('.tag')
      .map((i, tagElem) => $(tagElem).data('tag-view-model'));
    return Array.from(currentTags);
  }
}