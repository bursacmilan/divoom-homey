import { DivoomCommand } from '../divoom/divoom-command';
import { ChannelEnum } from './models/channel.enum';

export class SetIndexCommand extends DivoomCommand {
    public readonly selectIndex: ChannelEnum;

    constructor(channel: ChannelEnum) {
        super('Channel/SetIndex');
        this.selectIndex = channel;
    }
}
