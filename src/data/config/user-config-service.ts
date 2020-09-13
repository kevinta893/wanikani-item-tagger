class UserConfigService {

  private readonly userConfigKey = 'config/userConfig';

  private readonly dataContext: TamperMonkeyUserDataContext;

  constructor(dataContext: TamperMonkeyUserDataContext) {
    this.dataContext = dataContext;
  }

  async getConfig(): Promise<UserConfigModel> {
    var userConfig = await this.dataContext.get(this.userConfigKey);
    if (userConfig == null){
      return await this.resetConfig();
    }
    
    return await this.dataContext.get(this.userConfigKey);
  }

  async updateConfig(updatedConfig: UserConfigModel): Promise<void> {
    await this.dataContext.put(this.userConfigKey, updatedConfig);
  }

  async resetConfig(): Promise<UserConfigModel> {
    var defaultConfig = UserConfigModel.defaultConfig();
    await this.dataContext.put(this.userConfigKey, defaultConfig);
    return defaultConfig;
  }
}