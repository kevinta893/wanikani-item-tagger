class JsonReviewItemExportModel {
  reviewItems: {
    itemId: string;
    itemType: string;
    itemName: string;
    dateCreated: number;
    dateModified: number;
    tagIds: number[];
  }[];
  tagDictionary: {
    [tagId: number]: {
      tagId: number;
      tagText: string;
      tagColor: string;
      dateCreated: number;
      dateModified: number;
    }
  };
}