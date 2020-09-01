class TagStatsModelMapper {
  /**
   * Converts a review item database model to a view model
   * The 'tags' field is not mapped and will be an empty list
   * @param {ReviewItemDTO} reviewItemDto 
   */
  static mapDTOToViewModel(tag: TagDTO, relatedReviewItems: ReviewItemDTO[]): TagStatsViewModel {
    var tagStat = new TagStatsViewModel();
    tagStat.tag = tag;
    tagStat.taggedReviewItems = relatedReviewItems.map(reviewItem => {
      return {
        itemName: reviewItem.itemName,
        itemType: reviewItem.itemType,
      }
    });

    return tagStat;
  }
}