class TagValidator {

  static isValid(tagText) {
    if (
      StringUtil.isNullOrEmpty(tagText) || 
      StringUtil.hasNewLines(tagText) || 
      tagText.length > Constants.MAX_TAG_TEXT_LENGTH){
      return false;
    }

    return true;
  }
}