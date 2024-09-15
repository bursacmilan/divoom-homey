import { DivoomCommand } from '../divoom/divoom-command';

export class SendRemoteCommand extends DivoomCommand {
    public fileId: string;

    constructor(fileId: string) {
        super('Draw/SendRemote');
        this.fileId = fileId;
    }
}
