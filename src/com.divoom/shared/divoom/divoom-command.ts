export abstract class DivoomCommand {
    public command: string;

    protected constructor(command: string) {
        this.command = command;
    }

    public toJson(): string {
        return JSON.stringify(this);
    }
}
