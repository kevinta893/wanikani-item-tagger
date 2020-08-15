class TaggerConfigView {

  html = `
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
      <button id="tag-ui-config-export-csv">Export All Tags to CSV</button>
    </div>
    <div id="tag-ui-modal-background"></div>
  </div>
  `;
  css = `
  #tag-ui-config-modal {
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
  #tag-ui-modal-background{
    display: block;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0,0,0);
    background-color: rgba(0,0,0,0.4);
    z-index: -1;
    cursor: pointer;
  }
  #tag-ui-config-modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    z-index: 1;
    width: 80%;
  }
  
  #tag-ui-close-config-btn {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
  }
  
  #tag-ui-close-config-btn:hover,
  #tag-ui-close-config-btn:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }

  .tag-ui-stat-value{
    font-weight: bold;
  }
  `;
  configModal;

  listenersConfigModalOpened = [];
  listenersConfigModalClosed = [];
  listenersConfigCSVExportRequested = [];

  constructor() {
    $('body').append(this.html);
    GM_addStyle(this.css);

    // Get the modal
    var configModal = $('#tag-ui-config-modal');
    this.configModal = configModal;

    var openConfigBtn = $('#tag-ui-open-config-btn');
    openConfigBtn.on('click', () => {
      this.onConfigOpen();
    });

    var closeBtn = $("#tag-ui-close-config-btn");
    closeBtn.on('click', () => {
      this.onConfigClose();
    });

    // Click outside modal, close
    var modalBackgroundOverlay = $('#tag-ui-modal-background');
    modalBackgroundOverlay.on('click', () => {
      this.onConfigClose();
    });

    // CSV export button
    var csvExportBtn = $('tag-ui-config-export-csv');
    csvExportBtn.on('click', () => {
      this.exportCsv();
    });
  }

  /**
   * Shows the config modal popup
   */
  showConfigModal() {
    this.configModal.show();
  }

  /**
   * Hides the config modal popup
   */
  closeConfigModal() {
    this.configModal.hide();
  }

  /**
   * Adds user stats to the config page
   */
  showUserStats(statsModel) {
    var taggedItemCountLabel = $('#tag-ui-tagged-item-count');
    var tagCountLabel = $('#tag-ui-tag-count');

    taggedItemCountLabel.text(statsModel.TaggedItemCount);
    tagCountLabel.text(statsModel.TotalTagCount);
  }

  /**
   * Loads data to the config modal
   */
  onConfigOpen() {
    //Emit event
    this.listenersConfigModalOpened.forEach(handler => {
      handler();
    });
  }

  /**
   * Config modal is closed
   */
  onConfigClose() {
    //Emit event
    this.listenersConfigModalClosed.forEach(handler => {
      handler();
    });
  }

  /**
   * Starts the csv export process
   */
  exportCsv() {
    //Emit event
    this.listenersConfigModalClosed.forEach(handler => {
      handler();
    });
  }

  bindOnConfigOpen(handler) {
    this.listenersConfigModalOpened.push(handler);
  }

  bindOnConfigClose(handler) {
    this.listenersConfigModalClosed.push(handler);
  }

  bindOnConfigCSVExportRequested(handler) {
    this.listenersConfigCSVExportRequested.push(handler);
  }
}

class TaggerConfigController {

  tagConfigView;
  tagService;

  constructor(tagConfigView, tagService) {
    this.tagConfigView = tagConfigView;
    this.tagService = tagService;

    this.tagConfigView.bindOnConfigOpen(() => {
      this.tagService.getUserStats().then((userStats) => {
        this.tagConfigView.showUserStats(userStats);
      });
      this.tagConfigView.showConfigModal();
    });

    this.tagConfigView.bindOnConfigClose(() => {
      this.tagConfigView.closeConfigModal();
    });

    this.tagConfigView.bindOnConfigCSVExportRequested(() => {

    });
  }
}