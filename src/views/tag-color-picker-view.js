/**
 * Color picker UI
 * Uses pickr
 * https://github.com/Simonwep/pickr
 */
class TagColorPickerView {
  colorPicker;

  constructor(replaceElementSelector) {
    const defaultSwatch = [
      '#F15A5A',
      '#F0C419',
      '#4EBA6F',
      '#2D95BF',
      '#955BA5',
    ];
    this.colorPicker = Pickr.create({
      el: replaceElementSelector,
      theme: 'monolith',

      palette: true,
      swatches: defaultSwatch,
      default: defaultSwatch[4],

      components: {
        // Main components
        preview: true,
        opacity: false,
        hue: true,

        // Input / output Options
        interaction: {
          rgb: true,
          input: true,
          save: true
        }
      }
    });
  }

  getSelectedColor() {
    return this.colorPicker.getSelectedColor().toHEXA().toString();
  }
}