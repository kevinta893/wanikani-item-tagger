class NullConfigLauncher implements TagConfigLauncher {

  /**
   * Used on pages that do not need to have 
   * the open config button
   */
  getOpenConfigButtonId(): string{
    return '';
  }
}