class CsvExportModelMapper {

  static mapToExportModel(reviewItems: ReviewItemDTO[], tags: TagDTO[]): CsvReviewItemExportModel {
    var tagDictionary: { [tagId: number]: TagDTO } = {};
    tags.forEach(tag => {
      tagDictionary[tag.tagId] = tag;
    });

    var maxTags = -1;
    var exportReviewItems = reviewItems.map(reviewItem => {
      var reviewItemTags = reviewItem.tagIds.map(reviewItemTagId => tagDictionary[reviewItemTagId]);

      //Track maximum number of tags
      var numTags = reviewItem.tagIds.length
      if (maxTags < numTags) {
        maxTags = numTags;
      }

      return {
        reviewItem: reviewItem.itemName,
        type: ReviewItemType[reviewItem.itemType],
        dateCreated: new Date(reviewItem.dateCreated).toLocaleString(),
        lastUpdated: new Date(reviewItem.dateModified).toLocaleString(),
        tags: reviewItemTags.map(reviewItemTag => {
          return {
            tagText: reviewItemTag.tagText
          }
        })
      }
    });

    var csvExport = new CsvReviewItemExportModel();
    csvExport.rows = exportReviewItems;
    csvExport.maxTags = maxTags;

    return csvExport;
  }

  static mapToCsvRowData(csvExport: CsvReviewItemExportModel): any[][] {
    var headerRow = ['review_item', 'type', 'date_created', 'last_modified'];
    for (let i = 0; i < csvExport.maxTags; i++) {
      headerRow.push(`tag${i + 1}`);
    }

    var rows = [headerRow];
    csvExport.rows.forEach(exportRow => {
      var row = [
        exportRow.reviewItem,
        exportRow.type,
        exportRow.dateCreated,
        exportRow.lastUpdated
      ];

      row = row.concat(exportRow.tags.map(tag => tag.tagText));

      rows.push(row);
    });

    return rows;
  }
}
