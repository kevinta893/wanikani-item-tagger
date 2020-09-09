class TagConfigController {

  tagConfigView: TagConfigView;
  reviewItemService: ReviewItemService;

  constructor(tagConfigView: TagConfigView, reviewItemService: ReviewItemService) {
    this.tagConfigView = tagConfigView;
    this.reviewItemService = reviewItemService;

    this.tagConfigView.bindOnConfigOpen(() => {
      this.reviewItemService.getUserStats().then((userStats) => {
        this.tagConfigView.showUserStats(userStats);
      });
      this.reviewItemService.getAllTagStats().then((tagStats) => {
        this.tagConfigView.showTagStats(tagStats);
      });
      this.tagConfigView.showConfigModal();
    });

    this.tagConfigView.bindOnConfigClose(() => {
      this.tagConfigView.closeConfigModal();
    });

    this.tagConfigView.bindOnConfigCSVExportRequested(() => {
      this.exportCsv();
    });

    this.tagConfigView.bindOnConfigJSONExportRequested(() => {
      this.exportJson();
    });

    this.reviewItemService.getAllTagStats().then((tagStats) => {
      this.tagConfigView.showTagStats(tagStats);
    });

    // Export csv for a single tag stat
    this.tagConfigView.bindOnConfigCsvTagStatExportRequested((tagStat) => {
      this.exportTagStatCsv(tagStat);
    });
  }

  async exportTagStatCsv(tagStat: TagStatsViewModel): Promise<void> {
    var formattedDate = this.createCurrentDateTimeStamp();
    var truncatedTagText = tagStat.tag.tagText.substring(0, Constants.MAX_TAG_TEXT_LENGTH);
    var filenameSanitized = FileNameSanitizer.sanitizeFileName(truncatedTagText);
    var exportFileName = `tag-stat_${filenameSanitized}_${formattedDate}.csv`;

    var csvExport = CsvTagStatExportModelMapper.mapToExportModel(tagStat);
    var rowData = CsvTagStatExportModelMapper.mapToCsvRowData(csvExport);
    //@ts-ignore: Papa parse
    var csvString: string = Papa.unparse(rowData);

    FileExporter.exportFile(exportFileName, csvString, FileEncoding.UTF_8_BOM);
  }

  async exportCsv(): Promise<void> {
    this.reviewItemService.getCsvExportModel().then((csvExport) => {
      var formattedDate = this.createCurrentDateTimeStamp()
      var exportFileName = `wanikani-csv-export-tagged-review-items_${formattedDate}.csv`;

      var rowData = CsvExportModelMapper.mapToCsvRowData(csvExport);
      //@ts-ignore: Papa parse
      var csvString: string = Papa.unparse(rowData);

      FileExporter.exportFile(exportFileName, csvString, FileEncoding.UTF_8_BOM);
    });
  }

  async exportJson(): Promise<void> {
    this.reviewItemService.getJsonExportModel().then((jsonExport) => {
      var formattedDate = this.createCurrentDateTimeStamp()
      var exportFileName = `wanikani-json-export-tagged-review-items_${formattedDate}.json`;
      var jsonString = JSON.stringify(jsonExport);

      FileExporter.exportFile(exportFileName, jsonString, FileEncoding.UTF_8);
    });
  }

  /**
   * Gets the current time as a string timestamp
   */
  createCurrentDateTimeStamp(): string {
    const nowDateTime = new Date();
    const dateTimeFormat = new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'numeric',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });

    // Extra commas are required
    const [
      { value: month }, ,
      { value: day }, ,
      { value: year }, ,
      { value: hour }, ,
      { value: minute }, ,
      { value: second }
    ] = dateTimeFormat.formatToParts(nowDateTime);
    const formattedDate = `${year}-${month}-${day}_T${hour}-${minute}-${second}`;
    return formattedDate;
  }
}