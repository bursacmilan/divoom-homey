import { DivoomCommand } from '../divoom/divoom-command';
import { TimerStatusEnum } from './models/timer-status.enum';

export class SetTimerCommand extends DivoomCommand {
    public readonly minute?: number;
    public readonly second?: number;
    public readonly status: TimerStatusEnum;

    constructor(status: TimerStatusEnum, minute: number | undefined, second: number | undefined) {
        super('Tools/SetTimer');

        this.minute = minute;
        this.second = second;
        this.status = status;
    }
}
