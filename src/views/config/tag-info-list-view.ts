class TagInfoListView {

  private readonly html = `
    <div class="tag-info-list">
      <div class="tag-info-tag-stat-list"><div>
    </div>
  `;

  private readonly tagInfoElem: JQuery<HTMLElement>;
  private readonly tagInfoListElem: JQuery<HTMLElement>;

  private readonly tagInfoItemsList: TagInfoItemView[] = [];

  private readonly eventSelectionChanged = new EventEmitter();

  private itemInfoSelected: boolean;

  constructor(el: string, options = null) {
    var tagInfoElem = this.tagInfoElem = $(this.html);
    $(el).replaceWith(tagInfoElem);

    this.tagInfoListElem = tagInfoElem.find('.tag-info-tag-stat-list');
  }

  showTagStatsList(tagStats: TagStatsViewModel[]) {
    this.tagInfoListElem.children().remove();

    tagStats.forEach(tagStat => {
      var newTagInfoId = `tag-info-${tagStat.tag.tagId}`;
      var newTagInfoDetail = $(`<div id="${newTagInfoId}"><div>`)

      this.tagInfoListElem.append(newTagInfoDetail);
      var tagInfoItem = new TagInfoItemView(`#${newTagInfoId}`, tagStat);

      this.tagInfoItemsList.push(tagInfoItem);

      tagInfoItem.bindClicked((tagStat) => {
        var isInfoSelected = tagInfoItem.isSelected();

        this.tagInfoItemsList.forEach((tii) => {
          if (tii.getTagStat().tag.tagId != tagStat.tag.tagId) {
            tii.setSelection(false);
          }
        });

        if (isInfoSelected && !this.itemInfoSelected) {
          this.eventSelectionChanged.emit(tagStat);
        } else {
          this.eventSelectionChanged.emit(tagStat);
        }
        this.itemInfoSelected = isInfoSelected;
      });

      tagInfoItem.bindHoverOver((tagStat) => {
        if (!this.itemInfoSelected) {
          this.eventSelectionChanged.emit(tagStat);
        }
      });
    });
  }

  bindSelectionChanged(handler: (tagStat: TagStatsViewModel) => void) {
    this.eventSelectionChanged.addEventListener(handler);
  }
}