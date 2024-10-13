import { SimpleClass } from 'homey';
// eslint-disable-next-line import/no-extraneous-dependencies
import Semaphore from 'ts-semaphore';
import { DivoomCommand } from './divoom-command';
import { DivoomResponse } from './divoom-response';
import { DivoomResponseHelper } from './divoom-response-helper';

export class DivoomApi {
    private readonly _apiSemaphore = new Semaphore(1);

    private readonly _ip: string;

    constructor(ip: string) {
        this._ip = ip;
    }

    public async sendCommandImmediatelyAndGet<T extends DivoomResponse>(command: DivoomCommand, simpleClass: SimpleClass): Promise<T> {
        const { result } = await this._sendCommand<T>(command, simpleClass);
        return result ?? ({} as T);
    }

    public async sendCommand(command: DivoomCommand, simpleClass: SimpleClass): Promise<void> {
        await this._sendCommand(command, simpleClass);
    }

    private async _sendCommand<T extends DivoomResponse>(
        command: DivoomCommand,
        simpleClass: SimpleClass,
    ): Promise<{ result: T | undefined; success: boolean }> {
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
        } catch (error) {
            simpleClass.error(`Error while sending command ${command.toJson()}`, error);
            return { result: undefined, success: false };
        } finally {
            await new Promise(resolve => setTimeout(resolve, 500));
            this._apiSemaphore.release();
        }
    }
}
