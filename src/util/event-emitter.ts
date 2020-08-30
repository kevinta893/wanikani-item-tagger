/**
 * Event Emitter
 * C# style-ish event object
 */
class EventEmitter {
  private listeners: ((...eventData: any[]) => any)[] = [];

  constructor() {
  }

  addEventListener(handler: (...eventData: any[]) => any): void {
    this.listeners.push(handler);
  }

  emit(...eventData: any[]) {
    this.listeners.forEach(handler => {
      handler(...eventData);
    });
  }
}