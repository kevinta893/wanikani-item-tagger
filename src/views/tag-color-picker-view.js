/**
 * Color picker UI
 * Uses pickr
 * https://github.com/Simonwep/pickr
 */
class TagColorPickerView {
  colorPicker;

  constructor(replaceElementSelector) {
    const defaultSwatch = [
      '#DE392E',
      '#DF9326',
      '#E6E13D',
      '#37CB39',
      '#3D9DCE',
      '#5640D2'
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

    this.colorPicker.on('changestop', () => {
      var pickedColor = this.colorPicker.getColor();
      this.colorPicker.setColor(pickedColor.toHEXA().toString());
    });
  }

  getSelectedColor() {
    return this.colorPicker.getSelectedColor().toHEXA().toString();
  }
}