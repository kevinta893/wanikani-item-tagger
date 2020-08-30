class ReviewItemModelMapper {

  /**
   * Maps View model to database model
   * The 'tagIds' field will be mapped
   * @param {ReviewItemViewModel} reviewItemViewModel 
   */
  static mapViewModelToDTO(reviewItemViewModel: ReviewItemViewModel): ReviewItemDTO {
    var reviewItemDto = new ReviewItemDTO();
    reviewItemDto.itemId = reviewItemViewModel.itemId;
    reviewItemDto.itemType = reviewItemViewModel.itemType;
    reviewItemDto.itemName = reviewItemViewModel.itemName;
    reviewItemDto.tagIds = reviewItemViewModel.tags.map(tag => {
      return tag.tagId;
    });

    return reviewItemDto;
  }

  /**
   * Converts a review item database model to a view model
   * The 'tags' field is not mapped and will be an empty list
   * @param {ReviewItemDTO} reviewItemDto 
   */
  static mapDTOToViewModel(reviewItemDto: ReviewItemDTO): ReviewItemViewModel {
    var reviewItemViewModel = new ReviewItemViewModel();
    reviewItemViewModel.itemId = reviewItemDto.itemId;
    reviewItemViewModel.itemType = reviewItemDto.itemType;
    reviewItemViewModel.itemName = reviewItemDto.itemName;
    reviewItemViewModel.tags = [];

    return reviewItemViewModel;
  }
}