enum ItemTypes {
  Vocabulary,
  Kanji,
  Radical
}

class ItemTypeMapper {
  /**
   * Converts definition page url item type to the ItemTypes enum
   * @param {string} itemTypeText The item type based on the definition page URL
   */
  static mapUrlItemTypeToItemType(itemTypeText: string): ItemTypes {
    //TODO Refactor this into the definitions UI class since it is only used there.
    if (itemTypeText.toLowerCase() == 'vocabulary') {
      return ItemTypes.Vocabulary;
    }
    else if (itemTypeText.toLowerCase() == 'kanji') {
      return ItemTypes.Kanji;
    }
    else if (itemTypeText.toLowerCase() == 'radicals') {
      return ItemTypes.Radical;
    }

    throw new Error(`Unknown item type=${itemTypeText}`);
  }
}