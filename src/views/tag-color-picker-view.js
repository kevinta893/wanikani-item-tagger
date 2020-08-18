/**
 * Color picker UI
 * Uses pickr
 * https://github.com/Simonwep/pickr
 */
class TagColorPickerView {
  colorPicker;

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
    this.colorPicker = Pickr.create({
      el: replaceElementSelector,
      theme: 'monolith',

      palette: true,
      comparison: false,
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
      this.colorPicker.setColor(pickedColor.toHEXA().toString());
    });
  }

  getSelectedColor() {
    return this.colorPicker.getSelectedColor().toHEXA().toString();
  }
}