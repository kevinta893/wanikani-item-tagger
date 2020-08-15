class ReviewItemViewModel {
  itemId = '';
  itemType = '';
  itemName = '';

  tags = [];    //List of TagViewModel
}

function mapReviewItemViewModelToDTO(reviewItemViewModel) {
  var reviewItemDto = new ReviewItemDTO();
  reviewItemDto.itemId = reviewItemViewModel.itemId;
  reviewItemDto.itemType = reviewItemViewModel.itemType;
  reviewItemDto.itemName = reviewItemViewModel.itemName;
  reviewItemDto.tagIds = reviewItemViewModel.tags.map(tag => {
    return tag.tagId;
  });

  return reviewItemDto;
}

function mapReviewItemDTOToViewModel(reviewItemDto) {
  var reviewItemViewModel = new ReviewItemViewModel();
  reviewItemViewModel.itemId = reviewItemDto.itemId;
  reviewItemViewModel.itemType = reviewItemDto.itemType;
  reviewItemViewModel.itemName = reviewItemDto.itemName;
  reviewItemViewModel.tags = [];

  return reviewItemViewModel;
}