class StringUtil {
  /**
   * Determines if a string is either null or empty
   * @param {string} str 
   */
  static isNullOrEmpty(str: string): boolean {
    return (!str || 0 === str.length);
  }

  /**
   * Determine if the string has any new line characters
   * @param {string} str 
   */
  static hasNewLines(str: string): boolean {
    const hasNewLinesRegExp = /(\r\n|\n|\r)/gm;
    var hasNewLines = hasNewLinesRegExp.test(str);
    return hasNewLines;
  }
}