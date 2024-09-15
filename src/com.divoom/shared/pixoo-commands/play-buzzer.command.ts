import { DivoomCommand } from '../divoom/divoom-command';

export class PlayBuzzerCommand extends DivoomCommand {
    public activeTimeInCycle = 500;
    public offTimeInCycle = 500;
    public playTotalTime: number;

    constructor(playTime: number) {
        super('Device/PlayBuzzer');
        this.playTotalTime = playTime;
    }
}
