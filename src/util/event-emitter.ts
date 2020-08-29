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

  emit(...eventData :any[]){
    this.listeners.forEach(handler => {
      handler(...eventData);
    });
  }
}