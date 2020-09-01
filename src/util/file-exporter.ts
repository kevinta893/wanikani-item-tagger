class FileExporter {

  private static readonly BOM_Header = '%EF%BB%BF';

  /**
   * Triggers a download file prompt to the user with
   * the given data
   * @param filename Filename to save as. 'txt' extension assumed if not provided
   * @param text Text or string data to save
   * @param fileEncoding The file encoding to use
   */
  static exportFile(filename: string, text: string, fileEncoding: FileEncoding) {
    var dlElement = document.createElement('a');

    var encodedUriComponent = encodeURIComponent(text);
    var bomHeader = fileEncoding == FileEncoding.UTF_8_BOM ? FileExporter.BOM_Header : '';
    var hrefData = `data:text/plain;charset=utf-8,${bomHeader}${encodedUriComponent}`

    dlElement.setAttribute('href', hrefData);
    dlElement.setAttribute('download', filename);
    dlElement.style.display = 'none';

    dlElement.click();
  }
}