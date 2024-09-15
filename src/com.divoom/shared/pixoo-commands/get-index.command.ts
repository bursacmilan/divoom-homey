import { DivoomCommand } from '../divoom/divoom-command';

export class GetIndexCommand extends DivoomCommand {
    constructor() {
        super('Channel/GetIndex');
    }
}
