class TagModelMapper {

  /**
   * Converts tag view model to Database model
   * @param {TagViewModel} tagViewModel 
   * @return {TagDTO}
   */
  static mapViewModelToDTO(tagViewModel: TagViewModel): TagDTO {
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
  static mapDTOToViewModel(tagDto: TagDTO): TagViewModel {
    var tagViewModel = new TagViewModel();
    tagViewModel.tagId = tagDto.tagId;
    tagViewModel.tagText = tagDto.tagText;
    tagViewModel.tagColor = tagDto.tagColor;

    return tagViewModel;
  }
}