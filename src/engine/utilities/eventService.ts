import EventEmitter from 'eventemitter3';

class eventService extends EventEmitter {
  emit<T extends string | symbol>(event: T, ...args: any[]): boolean {
    console.log(
      `%c${event.toString()}`,
      `background: #007acc; color: #FFFFFF; padding: 5px`,
      args
    );
    return super.emit(event, ...args);
  }
}

export default new eventService();
