class ClassChangedObserver {

  /**
   * Attaches a listener to an HTML element that listens
   * for any changes to the class attribute of that element
   * @param jqueryElem JQuery object to listen for class changes
   * @param handler Callback handler when class changes
   */
  static attachClassChangedEvent(jqueryElem: JQuery<HTMLElement>, handler: (classValue: string) => void) {
    var observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          var attributeValue = $(mutation.target).prop(mutation.attributeName);
          handler(attributeValue);
        }
      });
    });
    observer.observe(jqueryElem[0], {
      attributes: true
    });
  }
}