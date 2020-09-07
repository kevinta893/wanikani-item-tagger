class TagConfigView {

  private readonly html = `
  <span id="tag-ui-open-config-btn">&#x2699;</span>
  
  <div id="tag-ui-config-modal">
    <div id="tag-ui-config-modal-content">
      <span id="tag-ui-close-config-btn">&times;</span>
      <h2>Tag statistics</h2>
      <p>
        Tagged Items <span id="tag-ui-tagged-item-count" class="tag-ui-stat-value"></span>
      </p>
      <p>
        Total Number of Tags <span id="tag-ui-tag-count" class="tag-ui-stat-value"></span>
      </p>
      <div id="tag-info-list"></div>

      <button id="tag-ui-config-export-csv">Export All Review Items to CSV</button>
      <button id="tag-ui-config-export-json">Export All Review Items and Tags to JSON</button>
    </div>
    <div id="tag-ui-modal-background"></div>
  </div>
  `;

  private configModal: JQuery<HTMLElement>;
  private tagInfoList: TagInfoListView;

  private readonly eventModalOpened = new EventEmitter();
  private readonly eventModalClosed = new EventEmitter();
  private readonly eventCSVExportRequested = new EventEmitter();
  private readonly eventJSONExportRequested = new EventEmitter();

  constructor() {
    $('body').append(this.html);

    // Get the modal
    var configModal = $('#tag-ui-config-modal');
    this.configModal = configModal;

    this.tagInfoList = new TagInfoListView('#tag-info-list');

    var openConfigBtn = $('#tag-ui-open-config-btn');
    openConfigBtn.on('click', () => {
      this.eventModalOpened.emit();
    });

    var closeBtn = $("#tag-ui-close-config-btn");
    closeBtn.on('click', () => {
      this.eventModalClosed.emit();
    });

    // Click outside modal, close
    var modalBackgroundOverlay = $('#tag-ui-modal-background');
    modalBackgroundOverlay.on('click', () => {
      this.eventModalClosed.emit();
    });

    // CSV export button
    var csvExportBtn = $('#tag-ui-config-export-csv');
    csvExportBtn.on('click', () => {
      this.eventCSVExportRequested.emit();
    });

    // JSON export button
    var jsonExportBtn = $('#tag-ui-config-export-json');
    jsonExportBtn.on('click', () => {
      this.eventJSONExportRequested.emit();
    });
  }

  showConfigModal(): void {
    this.configModal.show();
  }

  closeConfigModal(): void {
    this.configModal.hide();
  }

  showTagStats(tagStats: TagStatsViewModel[]) {
    this.tagInfoList.showTagStatsList(tagStats);
  }

  /**
   * Shows user stats to the config page
   */
  showUserStats(reviewItemStats: ReviewItemStatisticsViewModel): void {
    var taggedItemCountLabel = $('#tag-ui-tagged-item-count');
    var tagCountLabel = $('#tag-ui-tag-count');

    taggedItemCountLabel.text(reviewItemStats.taggedItemCount);
    tagCountLabel.text(reviewItemStats.totalTagCount);
  }

  bindOnConfigOpen(handler: () => void): void {
    this.eventModalOpened.addEventListener(handler);
  }

  bindOnConfigClose(handler: () => void): void {
    this.eventModalClosed.addEventListener(handler);
  }

  bindOnConfigCSVExportRequested(handler: () => void): void {
    this.eventCSVExportRequested.addEventListener(handler);
  }

  bindOnConfigJSONExportRequested(handler: () => void): void {
    this.eventJSONExportRequested.addEventListener(handler);
  }
}