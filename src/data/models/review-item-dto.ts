class ReviewItemDTO {
  itemId: string;
  itemType: ReviewItemType;
  itemName: string;

  tagIds: number[] = [];

  dateCreated: number;
  dateModified: number;
}