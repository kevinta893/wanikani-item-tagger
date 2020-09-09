class TagInfoItemView {
  private readonly html = `
    <div class="tag-info">
      <div class="tag-info-tag"></div>
      <div class="tag-info-review-item-list"><div>
    </div>
  `;

  private readonly tagInfoElem: JQuery<HTMLElement>;
  private readonly tagStat: TagStatsViewModel;

  private readonly eventHoverOver = new EventEmitter();
  private readonly eventClick = new EventEmitter();

  private readonly SELECTABLE_CLASS = 'tag-info-selectable';

  constructor(el: string, tagStat: TagStatsViewModel, options = null) {
    this.tagStat = tagStat;

    var tagInfoElem = this.tagInfoElem = $(this.html);
    $(el).replaceWith(tagInfoElem);
    tagInfoElem.attr('data-tag-id', tagStat.tag.tagId);

    var tagInfoTagElem = tagInfoElem.find('.tag-info-tag');
    tagInfoTagElem.text(tagStat.tag.tagText);
    tagInfoTagElem.css('background-color', tagStat.tag.tagColor);
    this.setSelection(false);

    tagInfoElem.on('click', (e) => {
      this.toggleSelection();
      this.eventClick.emit(this.tagStat);
    });

    tagInfoElem.on('mouseenter', (e) => {
      this.eventHoverOver.emit(this.tagStat);
    });
  }

  private toggleSelection(): void {
    var currentValue = this.isSelected();
    this.setSelection(!currentValue);
  }

  isSelected(): boolean {
    return !this.tagInfoElem.hasClass(this.SELECTABLE_CLASS);
  }

  setSelection(isSelected: boolean): void {
    if (isSelected) {
      this.tagInfoElem.removeClass(this.SELECTABLE_CLASS);
    } else {
      this.tagInfoElem.addClass(this.SELECTABLE_CLASS);
    }
  }

  getTagStat(): TagStatsViewModel {
    return this.tagStat;
  }

  bindClicked(handler: (tagStat: TagStatsViewModel) => void): void {
    this.eventClick.addEventListener(handler);
  }

  bindHoverOver(handler: (tagStat: TagStatsViewModel) => void): void {
    this.eventHoverOver.addEventListener(handler);
  }
}