class TagRepository {
  tagNamespace = "tags";
  dataContext;

  constructor(dataContext) {
    this.dataContext = dataContext;
  }

  async updateTag(tagDto) {
    if (this.isNullTagId(tagDto.tagId)) {
      throw new Error(`Tag update failed, tag id is null. Tag=${tagDto}`);
    }

    var key = this.generateStorageKey(tagDto.tagId);
    var tag = await this.dataContext.get(key);

    if (tag == null) {
      throw new Error(`Tag update failed, tag does not exist. Tag=${tagDto}`);
    }

    await this.dataContext.put(key, tagDto);
  }

  async putTag(tagDto) {
    if (!this.isNullTagId(tagDto.tagId)) {
      throw new Error(`Tag put failed, tag id must not be specified. Tag=${tagDto}`);
    }

    var tagId = (new Date()).getTime();
    var key = this.generateStorageKey(tagId);

    var tag = await this.dataContext.get(key);
    if (tag != null) {
      throw new Error(`Tag put failed, tag already exists. Tag=${tag}`);
    }

    tagDto.tagId = tagId;
    await this.dataContext.put(key, tagDto);
    return tagDto;
  }

  async getTag(tagId) {
    var key = this.generateStorageKey(tagId);
    return await this.dataContext.get(key);
  }

  async getTagByText(tagText) {
    var allTags = await this.dataContext
      .getAllValues((key) => key.indexOf(this.tagNamespace) == 0)
    var tagSearchResults = allTags
      .filter((tagDto) => tagDto.tagText == tagText);

    if (tagSearchResults == null || tagSearchResults.length == 0) {
      return null;
    }

    if (tagSearchResults.length > 1) {
      console.warn(`Warning: multiple tag entities exist with tagText=${tagText}`);
    }

    return tagSearchResults[0];
  }

  async getAllTags() {
    var allTags = await this.dataContext.getAllValues((key) => key.indexOf(this.tagNamespace) == 0);
    return allTags;
  }

  generateStorageKey(tagId) {
    return `${this.tagNamespace}/${tagId}`;
  }

  isNullTagId(tagId) {
    return tagId == null || tagId <= 0;
  }
}