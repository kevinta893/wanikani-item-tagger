class TagInfoDisplay {
  private readonly html = `
    <div>
      <h2 class="tag-display-tag-name">Tag Name</h2>
      <div>
        Review Items Tagged: <span id="tag-display-review-item-count">0</span>
      </div>
      <button id="tag-display-download-csv">Export CSV</button>
      <div id="tag-display-review-items"></div>
    </div>
  `;
  private readonly reviewItemTemplateHtml = `
    <div class="tag-display-review-item"></div>
  `;

  private readonly tagInfoDisplayElem: JQuery<HTMLElement>;
  private readonly tagInfoTitle: JQuery<HTMLElement>;
  private readonly tagReviewItemCount: JQuery<HTMLElement>;
  private readonly tagInfoDisplayReviewItemsList: JQuery<HTMLElement>;
  private readonly tagCsvExportButton: JQuery<HTMLElement>;

  private readonly eventCsvExported = new EventEmitter();

  private tagStatDisplayed: TagStatsViewModel;

  constructor(el: string, options = null) {
    var tagInfoElem = this.tagInfoDisplayElem = $(this.html);
    $(el).replaceWith(tagInfoElem);
    tagInfoElem.attr('id', el.substring(1));

    this.tagInfoDisplayReviewItemsList = this.tagInfoDisplayElem.find('#tag-display-review-items');
    this.tagInfoTitle = this.tagInfoDisplayElem.find('.tag-display-tag-name');
    this.tagReviewItemCount = this.tagInfoDisplayElem.find('#tag-display-review-item-count');
    this.tagCsvExportButton = this.tagInfoDisplayElem.find('#tag-display-download-csv');

    this.tagCsvExportButton.on('click', (e) => {
      this.eventCsvExported.emit(this.tagStatDisplayed);
    });
  }

  showTagStats(tagStat: TagStatsViewModel) {
    this.tagStatDisplayed = tagStat;

    this.tagInfoTitle.text(tagStat.tag.tagText);
    this.tagReviewItemCount.text(tagStat.taggedReviewItems.length);
    this.tagInfoDisplayReviewItemsList.children().remove();

    tagStat.taggedReviewItems.forEach(reviewItem => {
      var reviewItemElem = $(this.reviewItemTemplateHtml);
      reviewItemElem.text(reviewItem.itemName);

      var itemTypeClass = this.mapItemTypeToCssClass(reviewItem.itemType);
      reviewItemElem.addClass(itemTypeClass);

      this.tagInfoDisplayReviewItemsList.append(reviewItemElem);
    });
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

  bindCsvExported(handler: (tagStat: TagStatsViewModel) => void) {
    this.eventCsvExported.addEventListener(handler);
  }
}