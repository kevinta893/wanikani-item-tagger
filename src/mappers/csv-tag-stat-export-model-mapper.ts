class CsvTagStatExportModelMapper {

  static mapToExportModel(tagStat: TagStatsViewModel): CsvTagStatExportModel {
    var exportModel = new CsvTagStatExportModel();
    exportModel.tagText = tagStat.tag.tagText;
    exportModel.rows = tagStat.taggedReviewItems.map(reviewItem => {
      return {
        reviewItemText: reviewItem.itemName,
        reviewItemType: ReviewItemType[reviewItem.itemType]
      };
    });

    return exportModel;
  }

  static mapToCsvRowData(csvExport: CsvTagStatExportModel): any[][] {
    var headerRow = ['review_item', 'type'];

    var rows = [headerRow];
    csvExport.rows.forEach(exportRow => {
      var row = [
        exportRow.reviewItemText,
        exportRow.reviewItemType,
      ];

      rows.push(row);
    });

    return rows;
  }
}