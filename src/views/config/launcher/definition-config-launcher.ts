class DefinitionConfigLauncher implements TagConfigLauncher {

  private readonly html = `
  <li class="sitemap__section sitemap__section--subsection">
    <h3 class="sitemap__section-header sitemap__section-header--subsection">Userscripts</h3>
    <ul class="sitemap__pages">
      <li class="sitemap__page">
      <a id="tag-config-open">Tagger Config</a>
    </ul>
  </li>
  `;

  private readonly openConfigButtonSelector: string = '#tag-config-open';

  constructor() {
    $('#\#sitemap__account > ul').append(this.html);
  }

  getOpenConfigButtonId(): string {
    return this.openConfigButtonSelector;
  }
}