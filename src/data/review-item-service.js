class ReviewItemService {
  reviewItemRepository;
  tagRepository;

  constructor(reviewItemRepository, tagRepository) {
    this.reviewItemRepository = reviewItemRepository;
    this.tagRepository = tagRepository;
  }

  async putReviewItem(reviewItemViewModel) {
    var reviewItemDto = mapReviewItemViewModelToDTO(reviewItemViewModel);
    var tagDtos = reviewItemViewModel.tags.map(tagViewModel => mapTagViewModelToDTO(tagViewModel));

    var putTagTasks = [];
    tagDtos.forEach(tagDto => {
      putTagTasks.push(this.tagRepository.putTag(tagDto));
    });

    await Promise.all(putTagTasks);

    var updatedReviewItem = await this.reviewItemRepository.putReviewItem(reviewItemDto);
    reviewItemViewModel.itemId = updatedReviewItem.itemId;

    return reviewItemViewModel;
  }

  /**
   * Creates a new review item and saves it
   * @param {string} itemType 
   * @param {string} itemName 
   */
  async createNewReviewItem(itemType, itemName) {
    // Does not exist create and save
    var newReviewItemDto = new ReviewItemDTO();
    newReviewItemDto.itemType = itemType;
    newReviewItemDto.itemName = itemName;
    newReviewItemDto.tagIds = [];

    var newlyPutReviewItemDTO = await this.reviewItemRepository.putReviewItem(newReviewItemDto);

    var reviewItemViewModel = mapReviewItemDTOToViewModel(newlyPutReviewItemDTO);
    return reviewItemViewModel;
  }

  async addTagToReviewItem(reviewItemViewModel, tagViewModel) {
    var tagToAddDto = mapTagViewModelToDTO(tagViewModel);

    // Add new tag to database if it does not exist already
    var existingTagDto = await this.tagRepository.getTagByText(tagViewModel.tagText);
    if (existingTagDto == null) {
      //Tag does not exist, need to add
      existingTagDto = await this.tagRepository.putTag(tagToAddDto);
    }

    var reviewItemDto = mapReviewItemViewModelToDTO(reviewItemViewModel);
    reviewItemDto.tagIds.push(existingTagDto.tagId);

    await this.reviewItemRepository.updateReviewItem(reviewItemDto);

    //Update review model and return
    var existingTagViewModel = mapTagDTOToViewModel(existingTagDto);
    reviewItemViewModel.tags.push(existingTagViewModel);
    return reviewItemViewModel;
  }

  async removeTagFromReviewItem(reviewItemViewModel, tagViewModel) {
    reviewItemViewModel.tags = reviewItemViewModel.tags.filter(tag => tag.tagText != tagViewModel.tagText);

    var reviewItemDto = mapReviewItemViewModelToDTO(reviewItemViewModel);
    await this.reviewItemRepository.updateReviewItem(reviewItemDto);

    return reviewItemViewModel;
  }

  async getReviewItem(itemType, itemName) {
    var reviewItemDto = await this.reviewItemRepository.getReviewItem(itemType, itemName);
    if (reviewItemDto == null) {
      return null;
    }

    var reviewItemViewModel = mapReviewItemDTOToViewModel(reviewItemDto);
    // Get tags if any
    if (reviewItemDto.tagIds.length >= 1) {
      var tagViewModelGetTasks = reviewItemDto.tagIds.map(tagId => {
        return this.tagRepository.getTag(tagId);
      });

      var tags = await Promise.all(tagViewModelGetTasks);
      reviewItemViewModel.tags = tags;
    }

    return reviewItemViewModel;
  }

  async getUserStats() {
    var allTaggedItems = await this.reviewItemRepository.getAllReviewItems();
    var allTags = [].concat.apply([], allTaggedItems.map(item => item.tags));

    var statsModel = new ReviewItemStatisticsViewModel();
    statsModel.taggedItemCount = allTaggedItems.filter(item => item.tags.length > 0).length;
    statsModel.totalTagCount = allTags.length;

    return statsModel;
  }
}
