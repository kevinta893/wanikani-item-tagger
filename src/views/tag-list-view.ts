class TagListView {

  private readonly html = `
    <div id="tag-list">
    </div>
  `;
  private readonly newTagHtml = `
    <div class="tag"></div>
  `;
  private tagListRoot: JQuery<HTMLElement>;

  private reviewItem: ReviewItemViewModel;

  /**
   * Creates a tag editor view
   * @param {string} el Selector of the element to replace
   * @param {object} options Options for this tag editor
   */
  constructor(el: string, options = null) {
    // Configure the UI for the definition page
    var rootElement = $(el);
    rootElement.replaceWith(this.html);

    var tagListRoot = this.tagListRoot = $('#tag-list');
  }

  show(): void {
    this.tagListRoot.show();
  }

  hide(): void {
    this.tagListRoot.hide();
  }

  loadReviewItem(reviewItem: ReviewItemViewModel): void {
    this.reviewItem = reviewItem;

    this.removeAllTags();

    var sortedTags = reviewItem.tags.sort((tag1, tag2) => tag1.tagText.localeCompare(tag2.tagText))
    sortedTags.forEach(tagViewModel => {
      this.addTag(tagViewModel);
    });
  }

  addTag(tag: TagViewModel): void {
    var newTag = $(this.newTagHtml);
    newTag.attr('data-tag-id', tag.tagId);
    newTag.css('background-color', tag.tagColor);
    newTag.data('tag-view-model', tag);
    newTag.text(tag.tagText);

    this.tagListRoot.append(newTag);
  }

  removeTag(tag: TagViewModel): void {
    this.tagListRoot.find(`.tag[data-tag-id="${tag.tagId}"]`).get(0).remove();
  }

  removeAllTags(): void {
    this.tagListRoot.find('.tag').remove();
  }

  getCurrentTags(): Array<TagViewModel> {
    var currentTags = this.tagListRoot.find('.tag')
      .map((i, tagElem) => $(tagElem).data('tag-view-model'));
    return Array.from(currentTags);
  }

  getCurrentReviewItemViewModel(): ReviewItemViewModel {
    return this.reviewItem;
  }
}