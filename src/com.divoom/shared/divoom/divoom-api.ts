import { SimpleClass } from 'homey';
// eslint-disable-next-line import/no-extraneous-dependencies
import Semaphore from 'ts-semaphore';
import { DivoomCommand } from './divoom-command';
import { DivoomResponse } from './divoom-response';
import { DivoomResponseHelper } from './divoom-response-helper';

export class DivoomApi {
    private readonly _apiSemaphore = new Semaphore(1);
    private readonly _commandSemaphore = new Semaphore(1);

    private readonly _ip: string;

    private _commands: DivoomCommand[] = [];

    constructor(ip: string) {
        this._ip = ip;
    }

    public async sendCommandImmediatelyAndGet<T extends DivoomResponse>(command: DivoomCommand, simpleClass: SimpleClass): Promise<T> {
        const { result } = await this._sendCommand<T>(command, simpleClass);
        return result;
    }

    public async addToCommandList(command: DivoomCommand): Promise<void> {
        this._commands.push(command);
        return Promise.resolve();
    }

    public async addMultipleToCommandList(commands: DivoomCommand[]): Promise<void> {
        this._commands.push(...commands);
        return Promise.resolve();
    }

    public async sendCurrentCommandList(simpleClass: SimpleClass): Promise<void> {
        await this._commandSemaphore.aquire();
        const commands = [...this._commands];
        this._commands = [];
        this._commandSemaphore.release();

        for (const command of commands) {
            await this._sendCommand(command, simpleClass);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    private async _sendCommand<T extends DivoomResponse>(
        command: DivoomCommand,
        simpleClass: SimpleClass,
    ): Promise<{ result: T; success: boolean }> {
        try {
            await this._apiSemaphore.aquire();
            const commandString = command.toJson();

            const response = await fetch(`http://${this._ip}/post`, { method: 'POST', body: commandString });
            const responseText = await response.text();
            const parsedResponse = JSON.parse(responseText) as T;

            simpleClass.log(`Command ${commandString} sent to ${this._ip}. Response: ${responseText}`);

            const isSuccess = !DivoomResponseHelper.isErrorResponse(parsedResponse ?? { error_code: 999 });
            if (!isSuccess) {
                simpleClass.error(`Command ${commandString} failed. Response: ${responseText}`);
            }

            return { result: parsedResponse, success: isSuccess };
        } finally {
            this._apiSemaphore.release();
        }
    }
}
