class TagConfigController {

  private readonly tagConfigView: TagConfigView;
  private readonly reviewItemService: ReviewItemService;
  private readonly userConfigService: UserConfigService;

  constructor(tagConfigView: TagConfigView, reviewItemService: ReviewItemService, userConfigService: UserConfigService) {
    this.tagConfigView = tagConfigView;
    this.reviewItemService = reviewItemService;
    this.userConfigService = userConfigService;

    this.tagConfigView.bindOnConfigOpen(async () => {
      var configData: Promise<any>[] = [
        this.reviewItemService.getUserStats(),
        this.reviewItemService.getAllTagStats(),
        this.userConfigService.getConfig()
      ];

      var [userStats, tagStats, userConfig] = await Promise.all(configData);

      this.tagConfigView.showUserStats(userStats);
      this.tagConfigView.showTagStats(tagStats);
      this.tagConfigView.showConfigModal(userConfig);
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

    this.tagConfigView.bindOnConfigChanged((userConfig) => {
      this.userConfigService.updateConfig(userConfig);
    });

    // Export csv for a single tag stat
    this.tagConfigView.bindOnConfigCsvTagStatExportRequested((tagStat) => {
      this.exportTagStatCsv(tagStat);
    });

    // Load tag stats
    this.reviewItemService.getAllTagStats().then((tagStats) => {
      this.tagConfigView.showTagStats(tagStats);
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