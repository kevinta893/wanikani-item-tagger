/**
 * An object model of the Wanikani item
 * Contains only data that can be extracted from WaniKani
 */
class WanikaniItemDataModel {
  itemName = '';
  itemType = '';
}

/**
 * Mapping function that converts a wanikani item data object
 * and maps it to the review item view model
 * @param {WanikaniItemDataModel} wkItemModel A wanikani item data object representing the wanikani item on the page
 * @param {Array<TagViewModel>} currentTags (optional) An array/list of current user defined tags associated with the item, otherwise it is an empty list by default
 */
function mapToTaggerItem(wkItemModel, currentTags) {
  var taggerItem = new ReviewItemDTO();

  //Current tags is null, default to empty list
  if (currentTags == null) { currentTags = []; }

  //Map fields
  taggerItem.itemName = wkItemModel.itemName;
  taggerItem.itemType = wkItemModel.itemType;
  taggerItem.tags = currentTags;

  return taggerItem;
}