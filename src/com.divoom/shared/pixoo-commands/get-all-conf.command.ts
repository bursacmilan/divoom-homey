import { DivoomCommand } from '../divoom/divoom-command';

export class GetAllConfCommand extends DivoomCommand {
    constructor() {
        super('Channel/GetAllConf');
    }
}
