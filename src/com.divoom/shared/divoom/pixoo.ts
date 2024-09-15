import { SimpleClass } from 'homey';
import { DivoomApi } from './divoom-api';
import { ResetHttpGifIdCommand } from '../pixoo-commands/reset-http-gif-id.command';
import { SendHttpGifCommand } from '../pixoo-commands/send-http-gif.command';
import { GetAllConfCommand } from '../pixoo-commands/get-all-conf.command';
import { AllConfModel } from '../pixoo-commands/models/all-conf.model';
import { CurrentChannelResponse } from '../pixoo-commands/models/current-channel.response';
import { GetIndexCommand } from '../pixoo-commands/get-index.command';
import { OnOffScreenCommand } from '../pixoo-commands/on-off-screen.command';
import { ChannelEnum } from '../pixoo-commands/models/channel.enum';
import { SetIndexCommand } from '../pixoo-commands/set-index.command';
import { SetBrightnessCommand } from '../pixoo-commands/set-brightness-command';
import { SetTimerCommand } from '../pixoo-commands/set-timer.command';
import { TimerStatusEnum } from '../pixoo-commands/models/timer-status.enum';
import { TextScrollEnum } from '../pixoo-commands/models/text-scroll.enum';
import { TextAlignEnum } from '../pixoo-commands/models/text-align.enum';
import { SendHttpTextCommand } from '../pixoo-commands/send-http-text.command';
import { ClearHttpTextCommand } from '../pixoo-commands/clear-http-text.command';

export class Pixoo {
    private readonly _divoomApi: DivoomApi;
    private readonly _simpleClass: SimpleClass;
    private readonly _pixelCount: number;
    private readonly _size: number;

    private _counter: number = 0;
    private _textCounter: number = 0;
    private _buffer: Array<number[]>;

    constructor(ip: string, simpleClass: SimpleClass, size: number) {
        this._divoomApi = new DivoomApi(ip);
        this._simpleClass = simpleClass;
        this._pixelCount = size * size;
        this._size = size;
        this._buffer = new Array<number[]>(size * size).fill([0, 0, 0]);
    }

    public async init(): Promise<void> {
        await this.clearText();
        await this.clearBuffer();
    }

    public getAllConf(): Promise<AllConfModel> {
        return this._divoomApi.sendCommandAndGet<AllConfModel>(new GetAllConfCommand(), this._simpleClass);
    }

    public getCurrentChannel(): Promise<CurrentChannelResponse> {
        return this._divoomApi.sendCommandAndGet<CurrentChannelResponse>(new GetIndexCommand(), this._simpleClass);
    }

    public setOnOff(on: boolean): Promise<void> {
        return this._divoomApi.sendCommandAndThrowIfFailed(new OnOffScreenCommand(on), this._simpleClass);
    }

    public selectChannel(channel: ChannelEnum): Promise<void> {
        return this._divoomApi.sendCommandAndThrowIfFailed(new SetIndexCommand(channel), this._simpleClass);
    }

    public setBrightness(brightness: number): Promise<void> {
        return this._divoomApi.sendCommandAndThrowIfFailed(new SetBrightnessCommand(brightness), this._simpleClass);
    }

    public setTimer(status: TimerStatusEnum, minute: number | undefined, second: number | undefined): Promise<void> {
        return this._divoomApi.sendCommandAndThrowIfFailed(new SetTimerCommand(status, minute, second), this._simpleClass);
    }

    public async fillAndPush(color: string | number[]): Promise<void> {
        this._buffer = new Array<number[]>(this._pixelCount).fill(this._parseColor(color));
        await this._sendBuffer();
    }

    public async clearText(): Promise<void> {
        await this._divoomApi.sendCommandAndThrowIfFailed(new ClearHttpTextCommand(), this._simpleClass);
        this._textCounter = 0;
    }

    public async clearBuffer(): Promise<void> {
        await this._divoomApi.sendCommandAndThrowIfFailed(new ResetHttpGifIdCommand(), this._simpleClass);
        this._counter = 0;
    }

    public async drawText(
        x: number,
        y: number,
        dir: TextScrollEnum,
        textWidth: number,
        textString: string,
        speed: number,
        color: string,
        align: TextAlignEnum,
        clear: boolean,
    ): Promise<void> {
        if (this._textCounter === 20 || clear) {
            await this.clearText();
        }

        await this._divoomApi.sendCommandAndThrowIfFailed(
            new SendHttpTextCommand(this._textCounter++, x, y, dir, textWidth, textString, speed, color, align),
            this._simpleClass,
        );
    }

    private async _sendBuffer(): Promise<void> {
        if (this._counter >= 1000) {
            await this.clearBuffer();
        }

        await this._divoomApi.sendCommandAndThrowIfFailed(
            new SendHttpGifCommand(1, this._size, 0, this._counter++, 1000, Buffer.from(this._buffer.flat()).toString('base64')),
            this._simpleClass,
        );
    }

    private _parseColor(color: string | number[]): number[] {
        if (typeof color === 'string') {
            this._simpleClass.log('Convert color string to rgb');
            return this._hexToRgb(color);
        }

        return color;
    }

    private _hexToRgb(hex: string): number[] {
        if (hex[0] === '#') {
            hex = hex.slice(1);
        }

        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }

        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return [r, g, b];
    }
}
