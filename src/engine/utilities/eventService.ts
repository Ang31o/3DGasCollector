import EventEmitter from 'eventemitter3';
import { Events } from '../../events';

const excludeFromLog = [Events.GAS];

class eventService extends EventEmitter {
  emit<T extends string | symbol>(event: T, ...args: any[]): boolean {
    if (excludeFromLog.indexOf(event as Events) === -1)
      console.log(
        `%c${event.toString()}`,
        `background: #007acc; color: #FFFFFF; padding: 5px`,
        args
      );
    return super.emit(event, ...args);
  }
}

export default new eventService();
