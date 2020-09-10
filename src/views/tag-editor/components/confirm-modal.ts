class ConfirmModal {
  private readonly html = `
    <div class="confirm-modal-container">
      <div class="confirm-modal-text">Message</div>
      <button class="confirm-modal-button confirm-modal-ok">OK</button>
      <button class="confirm-modal-button confirm-modal-cancel">Cancel</button>
    <div>
  `;

  private readonly rootElement: JQuery<HTMLElement>;
  private readonly modalMessageText: JQuery<HTMLElement>;
  private readonly cancelButton: JQuery<HTMLElement>;
  private readonly okButton: JQuery<HTMLElement>;

  private viewOptions: ConfirmModalOptions;

  constructor(options: ConfirmModalOptions) {
    this.viewOptions = options;

    this.rootElement = $(this.html);
    $('body').append(this.rootElement);
    this.close();

    this.modalMessageText = this.rootElement.find('.confirm-modal-text');
    this.modalMessageText.text(options.messageText);

    this.okButton = this.rootElement.find('.confirm-modal-ok');
    this.okButton.on('click', (e) => {
      this.close();
      options.okCallback();
    });

    this.cancelButton = this.rootElement.find('.confirm-modal-cancel');
    this.cancelButton.on('click', (e) => {
      this.close();
      options.cancelCallback();
    });
    this.cancelButton.focus();

    //Dropdown loses focus, hide
    $(document).on('mouseup', (e) => {
      if (!this.isVisible()) {
        return;
      }

      var position = this.rootElement.position();
      var xPos = position.left;
      var yPos = position.top;
      var width = this.rootElement.outerWidth();
      var height = this.rootElement.outerHeight();

      var mouseX = e.pageX;
      var mouseY = e.pageY;

      // Outside div click
      if (mouseX < xPos || mouseX > xPos + width || mouseY < yPos || mouseY > yPos + height) {
        this.close();
      }
    });
  }

  isVisible(): boolean {
    return this.rootElement.is(':visible');
  }

  show(selector: string): void {
    var element = $(selector);

    var position = element.offset();
    var buttonHeight = element.outerHeight();
    var xPos = position.left;
    var yPos = position.top + buttonHeight;

    this.rootElement.css('left', xPos);
    this.rootElement.css('top', yPos);

    this.rootElement.show();
  }

  close(): void {
    this.rootElement.hide();
  }
}

class ConfirmModalOptions {
  messageText: string;
  okCallback: () => void;
  cancelCallback: () => void;
}