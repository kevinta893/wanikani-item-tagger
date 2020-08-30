enum ReviewItemType {
  Vocabulary,
  Kanji,
  Radical
}

class ItemTypeMapper {
  /**
   * Converts definition page url item type to the ItemTypes enum
   * @param {string} itemTypeText The item type based on the definition page URL
   */
  static mapUrlItemTypeToItemType(itemTypeText: string): ReviewItemType {
    //TODO Refactor this into the definitions UI class since it is only used there.
    if (itemTypeText.toLowerCase() == 'vocabulary') {
      return ReviewItemType.Vocabulary;
    }
    else if (itemTypeText.toLowerCase() == 'kanji') {
      return ReviewItemType.Kanji;
    }
    else if (itemTypeText.toLowerCase() == 'radicals') {
      return ReviewItemType.Radical;
    }

    throw new Error(`Unknown item type=${itemTypeText}`);
  }
}