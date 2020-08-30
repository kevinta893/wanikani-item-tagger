class ReviewItemRepository {
  private readonly reviewItemsNamespace = "review-items";
  private readonly dataContext: TamperMonkeyUserDataContext;

  constructor(dataContext: TamperMonkeyUserDataContext) {
    this.dataContext = dataContext;
  }

  async updateReviewItem(updatedReviewItem: ReviewItemDTO): Promise<void> {
    if (StringUtil.isNullOrEmpty(updatedReviewItem.itemId)) {
      throw new Error(`Review Item update failed, review item id is null. Review Item=${updatedReviewItem}`);
    }

    var key = this.generateStorageKey(updatedReviewItem.itemId);
    var currentReviewItem = await this.dataContext.get(key);

    if (currentReviewItem == null) {
      throw new Error(`Review Item update failed, review item does not exist. Review Item=${updatedReviewItem}`);
    }

    await this.dataContext.put(key, updatedReviewItem);
  }

  async putReviewItem(newReviewItem: ReviewItemDTO): Promise<ReviewItemDTO> {
    if (!StringUtil.isNullOrEmpty(newReviewItem.itemId)) {
      throw new Error(`Review Item put failed, item id must be null to insert object. Review Item=${currentReviewItem}`);
    }

    var reviewItemId = this.generateReviewItemId(newReviewItem.itemType, newReviewItem.itemName);
    var key = this.generateStorageKey(reviewItemId);

    var currentReviewItem = await this.dataContext.get(key);
    if (currentReviewItem != null) {
      throw new Error(`Review Item put failed, review item already exists. Review Item=${currentReviewItem}`);
    }

    newReviewItem.itemId = reviewItemId;
    await this.dataContext.put(key, newReviewItem);
    return newReviewItem;
  }

  async getReviewItem(reviewItemType: ReviewItemType, reviewItemName: string): Promise<ReviewItemDTO> {
    var reviewItemId = this.generateReviewItemId(reviewItemType, reviewItemName);
    var key = this.generateStorageKey(reviewItemId);
    return await this.dataContext.get(key);
  }

  async getAllReviewItems(): Promise<ReviewItemDTO[]> {
    var allItems = await this.dataContext.getAllValues((key) => key.indexOf(this.reviewItemsNamespace) == 0);
    return allItems;
  }

  async getAllReviewItemsWithTag(tagId): Promise<ReviewItemDTO[]> {
    var allReviewItems = await this.dataContext.getAllValues((key) => key.indexOf(this.reviewItemsNamespace) == 0);
    var allReviewItemsWithTag = allReviewItems.filter(reviewItemDto => reviewItemDto.tagIds.find(tId => tId == tagId) != null);
    return allReviewItemsWithTag;
  }

  generateReviewItemId(reviewItemType: ReviewItemType, reviewItemName: string): string {
    return `${reviewItemType}/${reviewItemName}`;
  }

  generateStorageKey(reviewItemId: string): string {
    return `${this.reviewItemsNamespace}/${reviewItemId}`;
  }
}