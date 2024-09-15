import { DivoomCommand } from '../divoom/divoom-command';

export class SetBrightnessCommand extends DivoomCommand {
    public readonly brightness: number;

    constructor(brightness: number) {
        super('Channel/SetBrightness');

        this.brightness = brightness;
    }
}
