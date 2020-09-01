class JsonReviewItemExportModel {
  reviewItems: {
    itemId: string;
    itemType: string;
    itemName: string;
    tagIds: number[];
  }[];
  tagDictionary: {
    [tagId: number]: {
      tagId: number;
      tagText: string;
      tagColor: string;
    }
  };
}