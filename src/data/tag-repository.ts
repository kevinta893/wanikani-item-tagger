class TagRepository {
  private readonly tagNamespace = "tags";
  private readonly dataContext: TamperMonkeyUserDataContext;

  constructor(dataContext: TamperMonkeyUserDataContext) {
    this.dataContext = dataContext;
  }

  async updateTag(updatedTag: TagDTO): Promise<void> {
    if (this.isNullTagId(updatedTag.tagId)) {
      throw new Error(`Tag update failed, tag id is null. Tag=${updatedTag}`);
    }

    var key = this.generateStorageKey(updatedTag.tagId);
    var currentTag = await this.dataContext.get(key);

    if (currentTag == null) {
      throw new Error(`Tag update failed, tag does not exist. Tag=${updatedTag}`);
    }

    await this.dataContext.put(key, updatedTag);
  }

  async putTag(newTag: TagDTO): Promise<TagDTO> {
    if (!this.isNullTagId(newTag.tagId)) {
      throw new Error(`Tag put failed, tag id must not be specified. Tag=${newTag}`);
    }

    var tagId = (new Date()).getTime();
    var key = this.generateStorageKey(tagId);

    var currentTag = await this.dataContext.get(key);
    if (currentTag != null) {
      throw new Error(`Tag put failed, tag already exists. Tag=${currentTag}`);
    }

    newTag.tagId = tagId;
    await this.dataContext.put(key, newTag);
    return newTag;
  }

  async getTag(tagId: number): Promise<TagDTO> {
    var key = this.generateStorageKey(tagId);
    return await this.dataContext.get(key);
  }

  async deleteTag(tagId: number): Promise<void> {
    var key = this.generateStorageKey(tagId);
    await this.dataContext.delete(key);
  }

  async getTagByText(tagText): Promise<TagDTO> {
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

  async getAllTags(): Promise<TagDTO[]> {
    var allTags = await this.dataContext.getAllValues((key) => key.indexOf(this.tagNamespace) == 0);
    return allTags;
  }

  generateStorageKey(tagId: number) {
    return `${this.tagNamespace}/${tagId}`;
  }

  isNullTagId(tagId) {
    return tagId == null || tagId <= 0;
  }
}