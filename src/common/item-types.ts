const ItemTypes = {
  Vocabulary: 'Vocabulary',
  Kanji: 'Kanji',
  Radical: 'Radical'
};

/**
 * Converts definition page url item type to the ItemTypes enum
 * @param {string} urlItemType The item type based on the definition page URL
 */
function mapUrlItemTypeToItemType(urlItemType) {
  //TODO Refactor this into the definitions UI class since it is only used there.
  if (urlItemType.toLowerCase() == 'vocabulary') {
    return ItemTypes.Vocabulary;
  }
  else if (urlItemType.toLowerCase() == 'kanji') {
    return ItemTypes.Kanji;
  }
  else if (urlItemType.toLowerCase() == 'radicals') {
    return ItemTypes.Radical;
  }

  throw new Error(`Unknown item type=${urlItemType}`);
}