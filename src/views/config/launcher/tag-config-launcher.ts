interface TagConfigLauncher {
  /**
   * Role of the launcher is to attach a button
   * to the page to open the config page
   * Then the button's element selector should be returned
   * for the config view to attach to and configure the event
   */

  getOpenConfigButtonId(): string;
}