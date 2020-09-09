class FileNameSanitizer {

  /**
   * Sanitizes a string so that the string
   * can be used in a file name
   * @param filename filename string to sanitize
   */
  static sanitizeFileName(filename: string): string{
    var filenameSanitized = filename.replace(/[^a-z0-9!@#$%^&&()_+\[\]\{\}]/gi, '_');

    return filenameSanitized;
  }
}