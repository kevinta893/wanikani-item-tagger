/**
 * Color picker UI
 * Uses pickr
 * https://github.com/Simonwep/pickr
 */
class TagColorPickerView {
  private readonly colorPicker;
  private readonly eventColorChanged = new EventEmitter();

  constructor(replaceElementSelector) {
    const defaultSwatch = [
      '#DE392E',  //red
      '#DF9326',  //orange
      '#E6E13D',  //yellow
      '#37CB39',  //green
      '#3D9DCE',  //blue
      '#5640D2',  //purple
      '#FF68FF',  //pink
      '#919191',  //grey
      '#1C1C1C'   //black
    ];

    //@ts-ignore: Cannot find name Pickr
    this.colorPicker = Pickr.create({
      el: replaceElementSelector,
      theme: 'monolith',

      palette: true,
      comparison: false,
      lockOpacity: true,
      swatches: defaultSwatch,
      default: defaultSwatch[0],

      components: {
        // Main components
        preview: true,
        opacity: false,
        hue: true,

        // Input / output Options
        interaction: {
          input: true,
          save: false
        }
      }
    });

    this.colorPicker.on('change', () => {
      var pickedColor = this.colorPicker.getColor();
      var pickedColorHex = pickedColor.toHEXA().toString();
      this.colorPicker.setColor(pickedColor.toHEXA().toString());
      this.eventColorChanged.emit(pickedColorHex);
    });
  }

  getSelectedColor(): string {
    return this.colorPicker.getSelectedColor().toHEXA().toString();
  }

  setSelectedColor(hexColor: string): void {
    this.colorPicker.setColor(hexColor);
  }

  bindColorSelected(handler: (hexColor: string) => void): void {
    this.eventColorChanged.addEventListener(handler);
  }
}