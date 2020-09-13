class UserConfigModel {

  alwaysShowTagsDuringReview: boolean;

  /**
   * Creates a new config DTO with all default config values
   */
  static defaultConfig(): UserConfigModel {
    var configDTO = new UserConfigModel();
    configDTO.alwaysShowTagsDuringReview = false;
    return configDTO;
  }
}