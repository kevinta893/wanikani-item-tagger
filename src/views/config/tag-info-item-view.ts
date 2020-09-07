class TagInfoItemView {
  private readonly html = `
    <div class="tag-info">
      <div class="tag-info-tag"></div>
      <div class="tag-info-review-item-list"><div>
    </div>
  `;

  private readonly reviewItemTemplateHtml = `
    <div class="tag-info-review-item"></div>
  `;

  private readonly tagInfoElem: JQuery<HTMLElement>;
  private readonly tagInfoReviewItemsList: JQuery<HTMLElement>;
  private tag: TagStatsViewModel;

  constructor(el: string, tagStat: TagStatsViewModel, options = null) {
    var tagInfoElem = this.tagInfoElem = $(this.html);
    $(el).replaceWith(tagInfoElem);
    tagInfoElem.attr('id', el);

    var tagInfoTagElem = tagInfoElem.find('.tag-info-tag');
    tagInfoTagElem.text(tagStat.tag.tagText);
    tagInfoTagElem.css('background-color', tagStat.tag.tagColor);

    var tagInfoReviewItemsList = this.tagInfoReviewItemsList = tagInfoElem.find('.tag-info-review-item-list');
    tagInfoReviewItemsList.attr('id', `tag-info-review-item-list-${tagStat.tag.tagId}`);

    tagStat.taggedReviewItems.forEach(reviewItem => {
      var reviewItemElem = $(this.reviewItemTemplateHtml);
      reviewItemElem.text(reviewItem.itemName);

      var itemTypeClass = this.mapItemTypeToCssClass(reviewItem.itemType);
      reviewItemElem.addClass(itemTypeClass);

      this.tagInfoReviewItemsList.append(reviewItemElem);
    });

    //this.hideTagInfo();
  }

  showTagInfo() {
    this.tagInfoReviewItemsList.show();
  }

  hideTagInfo(){
    this.tagInfoReviewItemsList.hide();
  }

  private mapItemTypeToCssClass(itemType: ReviewItemType): string {
    if (itemType == ReviewItemType.Vocabulary) {
      return 'tag-info-review-item-vocabulary';
    }

    if (itemType == ReviewItemType.Kanji) {
      return 'tag-info-review-item-kanji';
    }

    if (itemType == ReviewItemType.Radical) {
      return 'tag-info-review-item-radical';
    }

    throw new Error(`Could not map item type=${itemType}`);
  }
}