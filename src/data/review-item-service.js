class ReviewItemService {
  reviewItemRepository;
  tagRepository;

  constructor(reviewItemRepository, tagRepository) {
    this.reviewItemRepository = reviewItemRepository;
    this.tagRepository = tagRepository;
  }

  async putReviewItem(reviewItemViewModel) {
    var reviewItemDto = ReviewItemModelMapper.mapViewModelToDTO(reviewItemViewModel);
    var tagDtos = reviewItemViewModel.tags.map(tagViewModel => TagModelMapper.mapViewModelToDTO(tagViewModel));

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

    var reviewItemViewModel = ReviewItemModelMapper.mapDTOToViewModel(newlyPutReviewItemDTO);
    return reviewItemViewModel;
  }

  async addTagToReviewItem(reviewItemViewModel, tagViewModel) {
    // Add new tag to database if it does not exist already
    var existingTagDto = await this.tagRepository.getTagByText(tagViewModel.tagText);
    if (existingTagDto == null) {
      //Tag does not exist, need to add
      var tagToAddDto = TagModelMapper.mapViewModelToDTO(tagViewModel);
      existingTagDto = await this.tagRepository.putTag(tagToAddDto);
    }

    var reviewItemDto = ReviewItemModelMapper.mapViewModelToDTO(reviewItemViewModel);
    reviewItemDto.tagIds.push(existingTagDto.tagId);

    await this.reviewItemRepository.updateReviewItem(reviewItemDto);

    //Update review model and return
    var existingTagViewModel = TagModelMapper.mapDTOToViewModel(existingTagDto);
    reviewItemViewModel.tags.push(existingTagViewModel);
    return reviewItemViewModel;
  }

  async removeTagFromReviewItem(reviewItemViewModel, tagViewModel) {
    reviewItemViewModel.tags = reviewItemViewModel.tags.filter(tag => tag.tagText != tagViewModel.tagText);

    var reviewItemDto = ReviewItemModelMapper.mapViewModelToDTO(reviewItemViewModel);
    await this.reviewItemRepository.updateReviewItem(reviewItemDto);

    return reviewItemViewModel;
  }

  async getReviewItem(itemType, itemName) {
    var reviewItemDto = await this.reviewItemRepository.getReviewItem(itemType, itemName);
    if (reviewItemDto == null) {
      return null;
    }

    var reviewItemViewModel = ReviewItemModelMapper.mapDTOToViewModel(reviewItemDto);
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

  async addNewTag(tagViewModel){
    var existingTagDto = await this.tagRepository.getTagByText(tagViewModel.tagText);
    if (existingTagDto != null) {
      throw new Error(`Tag already exists with text=${tagViewModel.tagText}`);
    }
    
    //Tag does not exist, add
    var tagToAddDto = TagModelMapper.mapViewModelToDTO(tagViewModel);
    var addedTagDto = await this.tagRepository.putTag(tagToAddDto);
    return TagModelMapper.mapDTOToViewModel(addedTagDto);
  }

  async updateTag(tagViewModel){
    var existingTagDto = await this.tagRepository.getTag(tagViewModel.tagId);
    if (existingTagDto == null) {
      throw new Error(`Cannot update non-existant tag. TagId=${tagViewModel.tagId}`);
    }

    var tagToUpdateDto = TagModelMapper.mapViewModelToDTO(tagViewModel);
    await this.tagRepository.updateTag(tagToUpdateDto);
  }

  async deleteTag(tagViewModel){
    var existingTagDto = await this.tagRepository.getTag(tagViewModel.tagId);
    if (existingTagDto == null) {
      throw new Error(`Cannot delete non-existant tag. TagId=${tagViewModel.tagId}`);
    }

    //Delete tag off all review items that contain it
    console.log('Stub delete');
  }

  async getAllSelectableTags(){
    var tagDtos = await this.tagRepository.getAllTags();
    var tagViewModels = tagDtos.map(tagDto => TagModelMapper.mapDTOToViewModel(tagDto));
    return tagViewModels;
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
