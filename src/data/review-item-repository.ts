class ReviewItemRepository {
  reviewItemsNamespace = "review-items";
  dataContext;

  constructor(dataContext) {
    this.dataContext = dataContext;
  }

  async updateReviewItem(reviewItemDto) {
    if (StringUtil.isNullOrEmpty(reviewItemDto.itemId)) {
      throw new Error(`Review Item update failed, review item id is null. Review Item=${reviewItem}`);
    }

    var key = this.generateStorageKey(reviewItemDto.itemId);
    var reviewItem = await this.dataContext.get(key);

    if (reviewItem == null) {
      throw new Error(`Review Item update failed, review item does not exist. Review Item=${reviewItem}`);
    }

    await this.dataContext.put(key, reviewItemDto);
  }

  async putReviewItem(reviewItemDto) {
    if (!StringUtil.isNullOrEmpty(reviewItemDto.itemId)) {
      throw new Error(`Review Item put failed, item id must be null to insert object. Review Item=${reviewItem}`);
    }

    var reviewItemId = this.generateReviewItemId(reviewItemDto.itemType, reviewItemDto.itemName);
    var key = this.generateStorageKey(reviewItemId);

    var reviewItem = await this.dataContext.get(key);
    if (reviewItem != null) {
      throw new Error(`Review Item put failed, review item already exists. Review Item=${reviewItem}`);
    }

    reviewItemDto.itemId = reviewItemId;
    await this.dataContext.put(key, reviewItemDto);
    return reviewItemDto;
  }

  async getReviewItem(reviewItemType, reviewItemName) {
    var reviewItemId = this.generateReviewItemId(reviewItemType, reviewItemName);
    var key = this.generateStorageKey(reviewItemId);
    return await this.dataContext.get(key);
  }

  async getAllReviewItems() {
    var allItems = await this.dataContext.getAllValues((key) => key.indexOf(this.reviewItemsNamespace) == 0);
    return allItems;
  }

  async getAllReviewItemsWithTag(tagId) {
    var allReviewItems = await this.dataContext.getAllValues((key) => key.indexOf(this.reviewItemsNamespace) == 0);
    var allReviewItemsWithTag = allReviewItems.filter(reviewItemDto => reviewItemDto.tagIds.find(tId => tId == tagId) != null);
    return allReviewItemsWithTag;
  }

  generateReviewItemId(reviewItemType, reviewItemName) {
    return `${reviewItemType}/${reviewItemName}`;
  }

  generateStorageKey(reviewItemId) {
    return `${this.reviewItemsNamespace}/${reviewItemId}`;
  }
}