class JsonExportModelMapper {

  static mapToExportModel(reviewItems: ReviewItemDTO[], tags: TagDTO[]): JsonReviewItemExportModel {
    var exportReviewItems = reviewItems.map(reviewItem => {
      return {
        itemId: reviewItem.itemId,
        itemType: ReviewItemType[reviewItem.itemType],
        itemName: reviewItem.itemName,
        tagIds: reviewItem.tagIds
      }
    });

    var exportTags = tags.map(tag => {
      return {
        tagId: tag.tagId,
        tagText: tag.tagText,
        tagColor: tag.tagColor,
      }
    });

    var exportTagDictionary = {};
    exportTags.forEach(tag => {
      exportTagDictionary[tag.tagId] = tag;
    });

    var jsonExport = new JsonReviewItemExportModel();
    jsonExport.reviewItems = exportReviewItems;
    jsonExport.tagDictionary = exportTagDictionary;

    return jsonExport;
  }
}
