/**
 * Event Emitter
 * C# style-ish event object
 */
class EventEmitter {
  listeners = [];

  constructor() {
  }

  addEventListener(handler) {
    this.listeners.push(handler);
  }

  emit(eventData) {
    this.listeners.forEach(handler => {
      handler(eventData);
    });
  }

  emit(eventData1, eventData2) {
    this.listeners.forEach(handler => {
      handler(eventData1, eventData2);
    });
  }
}