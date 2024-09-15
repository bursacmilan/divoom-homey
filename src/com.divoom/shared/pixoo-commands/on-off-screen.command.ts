import { DivoomCommand } from '../divoom/divoom-command';

export class OnOffScreenCommand extends DivoomCommand {
    public onOff: number;

    constructor(onOff: boolean) {
        super('Channel/OnOffScreen');
        this.onOff = onOff ? 1 : 0;
    }
}
