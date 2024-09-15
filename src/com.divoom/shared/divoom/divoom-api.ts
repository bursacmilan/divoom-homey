import { SimpleClass } from 'homey';
import { DivoomCommand } from './divoom-command';
import { DivoomResponse } from './divoom-response';
import { DivoomResponseHelper } from './divoom-response-helper';

export class DivoomApi {
    private readonly _ip: string;

    constructor(ip: string) {
        this._ip = ip;
    }

    public async sendCommandAndThrowIfFailed(command: DivoomCommand, simpleClass: SimpleClass): Promise<void> {
        const { success } = await this.sendCommand<DivoomResponse>(command, simpleClass);
        if (!success) {
            throw new Error(`Command ${command.toJson()} failed`);
        }
    }

    public async sendCommandAndGet<T extends DivoomResponse>(command: DivoomCommand, simpleClass: SimpleClass): Promise<T> {
        const { result } = await this.sendCommand<T>(command, simpleClass);
        return result;
    }

    public async sendCommand<T extends DivoomResponse>(
        command: DivoomCommand,
        simpleClass: SimpleClass,
    ): Promise<{ result: T; success: boolean }> {
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
    }
}
