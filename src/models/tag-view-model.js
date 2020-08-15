/**
 * Represents data for 1 tag
 * Contains information on how to display the tag on the UI
 */
class TagViewModel {
  tagId = 0;
  tagText = '';
  tagColor = '';     //Hexadecimal color
}

/**
 * Converts tag view model to Database model
 * @param {TagViewModel} tagViewModel 
 * @return {TagDTO}
 */
function mapTagViewModelToDTO(tagViewModel) {
  var tagDto = new TagDTO();
  tagDto.tagId = tagViewModel.tagId;
  tagDto.tagText = tagViewModel.tagText;
  tagDto.tagColor = tagViewModel.tagColor;

  return tagDto;
}

/**
 * Converts tag database model to view model
 * @param {TagViewModel} tagViewModel 
 * @return {TagDTO}
 */
function mapTagDTOToViewModel(tagDto) {
  var tagViewModel = new TagViewModel();
  tagViewModel.tagId = tagDto.tagId;
  tagViewModel.tagText = tagDto.tagText;
  tagViewModel.tagColor = tagDto.tagColor;

  return tagViewModel;
}