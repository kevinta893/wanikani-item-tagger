class ReviewItemService {
  private readonly reviewItemRepository: ReviewItemRepository;
  private readonly tagRepository: TagRepository;

  constructor(reviewItemRepository: ReviewItemRepository, tagRepository: TagRepository) {
    this.reviewItemRepository = reviewItemRepository;
    this.tagRepository = tagRepository;
  }

  async putReviewItem(newReviewItem: ReviewItemViewModel): Promise<ReviewItemViewModel> {
    var reviewItemDto = ReviewItemModelMapper.mapViewModelToDTO(newReviewItem);
    var tagDtos = newReviewItem.tags.map(tagViewModel => TagModelMapper.mapViewModelToDTO(tagViewModel));

    var putTagTasks = [];
    tagDtos.forEach(tagDto => {
      putTagTasks.push(this.tagRepository.putTag(tagDto));
    });

    await Promise.all(putTagTasks);

    var newlyPutReviewItem = await this.reviewItemRepository.putReviewItem(reviewItemDto);
    newReviewItem.itemId = newlyPutReviewItem.itemId;

    return newReviewItem;
  }

  /**
   * Creates a new review item and saves it
   * @param {string} itemType 
   * @param {string} itemName 
   */
  async createNewReviewItem(itemType: ReviewItemType, itemName: string): Promise<ReviewItemViewModel> {
    // Does not exist create and save
    var newReviewItemDto = new ReviewItemDTO();
    newReviewItemDto.itemType = itemType;
    newReviewItemDto.itemName = itemName;
    newReviewItemDto.tagIds = [];

    var newlyPutReviewItemDTO = await this.reviewItemRepository.putReviewItem(newReviewItemDto);

    var reviewItemViewModel = ReviewItemModelMapper.mapDTOToViewModel(newlyPutReviewItemDTO);
    return reviewItemViewModel;
  }

  async addTagToReviewItem(reviewItem: ReviewItemViewModel, newTagToAttach: TagViewModel): Promise<ReviewItemViewModel> {
    // Add new tag to database if it does not exist already
    var existingTagDto = await this.tagRepository.getTagByText(newTagToAttach.tagText);
    if (existingTagDto == null) {
      //Tag does not exist, need to add
      var tagToAddDto = TagModelMapper.mapViewModelToDTO(newTagToAttach);
      existingTagDto = await this.tagRepository.putTag(tagToAddDto);
    }

    var reviewItemDto = ReviewItemModelMapper.mapViewModelToDTO(reviewItem);
    reviewItemDto.tagIds.push(existingTagDto.tagId);

    await this.reviewItemRepository.updateReviewItem(reviewItemDto);

    //Update review model and return
    var existingTagViewModel = TagModelMapper.mapDTOToViewModel(existingTagDto);
    reviewItem.tags.push(existingTagViewModel);
    return reviewItem;
  }

  async removeTagFromReviewItem(reviewItem: ReviewItemViewModel, tagToRemove: TagViewModel): Promise<ReviewItemViewModel> {
    reviewItem.tags = reviewItem.tags.filter(tag => tag.tagText != tagToRemove.tagText);

    var reviewItemDto = ReviewItemModelMapper.mapViewModelToDTO(reviewItem);
    await this.reviewItemRepository.updateReviewItem(reviewItemDto);

    return reviewItem;
  }

  async getReviewItem(itemType: ReviewItemType, itemName: string): Promise<ReviewItemViewModel> {
    var reviewItemDto = await this.reviewItemRepository.getReviewItem(itemType, itemName);
    if (reviewItemDto == null) {
      return null;
    }

    var currentReviewItem = ReviewItemModelMapper.mapDTOToViewModel(reviewItemDto);
    // Get tags if any
    if (reviewItemDto.tagIds.length >= 1) {

      var tagGetTasks = [];
      reviewItemDto.tagIds.forEach(tagId => {
        var getPromise = new Promise(async (resolve, reject) => {
          var tag = this.tagRepository.getTag(tagId);
          if (tag == null) {
            reject(new Error(`Tag does not exist with id=${tagId}`))
          }
          resolve(tag);
        });
        tagGetTasks.push(getPromise);
      });

      var tags = await Promise.all(tagGetTasks);
      currentReviewItem.tags = tags.map(tagDto => TagModelMapper.mapDTOToViewModel(tagDto));
    }

    return currentReviewItem;
  }

  async addNewTag(newTag: TagViewModel): Promise<TagViewModel> {
    var existingTagDto = await this.tagRepository.getTagByText(newTag.tagText);
    if (existingTagDto != null) {
      throw new Error(`Tag already exists with text=${newTag.tagText}`);
    }

    //Tag does not exist, add
    var tagToAddDto = TagModelMapper.mapViewModelToDTO(newTag);
    var addedTagDto = await this.tagRepository.putTag(tagToAddDto);
    return TagModelMapper.mapDTOToViewModel(addedTagDto);
  }

  async updateTag(tagViewModel: TagViewModel): Promise<void> {
    var existingTagDto = await this.tagRepository.getTag(tagViewModel.tagId);
    if (existingTagDto == null) {
      throw new Error(`Cannot update non-existant tag. TagId=${tagViewModel.tagId}`);
    }

    var tagToUpdateDto = TagModelMapper.mapViewModelToDTO(tagViewModel);
    await this.tagRepository.updateTag(tagToUpdateDto);
  }

  async deleteTag(deletedTag: TagViewModel): Promise<void> {
    var existingTagDto = await this.tagRepository.getTag(deletedTag.tagId);
    if (existingTagDto == null) {
      throw new Error(`Cannot delete non-existant tag. TagId=${deletedTag.tagId}`);
    }

    //Delete tag off all review items that contain it
    var allReviewItemsWithTag = await this.reviewItemRepository.getAllReviewItemsWithTag(deletedTag.tagId);
    var allRemoveTagTasks = [];
    allReviewItemsWithTag.forEach(reviewItemDto => {
      allRemoveTagTasks.push(this.removeTagFromReviewItemDto(reviewItemDto, existingTagDto.tagId));
    });

    await Promise.all(allRemoveTagTasks)
    await this.tagRepository.deleteTag(existingTagDto.tagId);
  }

  private async removeTagFromReviewItemDto(reviewItemDto: ReviewItemDTO, tagIdToRemove: number) {
    reviewItemDto.tagIds = reviewItemDto.tagIds.filter((tagId) => tagId != tagIdToRemove);
    await this.reviewItemRepository.updateReviewItem(reviewItemDto);
  }

  async getAllSelectableTags(): Promise<TagViewModel[]> {
    var tagDtos = await this.tagRepository.getAllTags();
    var tagViewModels = tagDtos.map(tagDto => TagModelMapper.mapDTOToViewModel(tagDto));
    return tagViewModels;
  }

  async getUserStats(): Promise<ReviewItemStatisticsViewModel> {
    var allTaggedItems = await this.reviewItemRepository.getAllReviewItems();
    var allTags = [].concat.apply([], allTaggedItems.map(item => item.tagIds));

    var statsModel = new ReviewItemStatisticsViewModel();
    statsModel.taggedItemCount = allTaggedItems.filter(item => item.tagIds.length > 0).length;
    statsModel.totalTagCount = allTags.length;

    return statsModel;
  }
}
