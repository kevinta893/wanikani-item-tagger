class TagInfoListView {

  private readonly html = `
    <div class="tag-info-list">
      <div class="tag-info-tag-stat-list"><div>
    </div>
  `;

  private readonly tagInfoElem: JQuery<HTMLElement>;
  private readonly tagInfoListElem: JQuery<HTMLElement>;

  private readonly tagInfoItemsDictionary: TagInfoItemView[] = [];

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

      this.tagInfoItemsDictionary[tagStat.tag.tagId] = tagInfoItem;
    });
  }
}