import { DivoomCommand } from '../divoom/divoom-command';

export class CommandListCommand extends DivoomCommand {
    public commandList: DivoomCommand[];
    constructor(commands: DivoomCommand[]) {
        super('Draw/CommandList');
        this.commandList = commands;
    }
}
