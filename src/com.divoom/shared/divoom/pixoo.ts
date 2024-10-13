import { SimpleClass } from 'homey';
// eslint-disable-next-line import/no-extraneous-dependencies
import { decompressFrames, parseGIF } from 'gifuct-js';
// eslint-disable-next-line import/no-extraneous-dependencies
import { intToRGBA, Jimp } from 'jimp';
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
import { DiscoveryApi } from '../discovery/discovery-api';
import { SendRemoteCommand } from '../pixoo-commands/send-remote.command';
import { PlayBuzzerCommand } from '../pixoo-commands/play-buzzer.command';
import { DivoomCommand } from './divoom-command';
import { CommandListCommand } from '../pixoo-commands/command-list.command';

export class Pixoo {
    private readonly _divoomApi: DivoomApi;
    private readonly _simpleClass: SimpleClass;
    private readonly _discoveryApi: DiscoveryApi;
    private readonly _pixelCount: number;
    private readonly _size: number;
    private readonly _deviceId: string;
    private readonly _macAddress: string;

    private _counter: number = 0;
    private _textCounter: number = 0;

    constructor(ip: string, deviceId: string, macAddress: string, simpleClass: SimpleClass, size: number) {
        this._divoomApi = new DivoomApi(ip);
        this._simpleClass = simpleClass;
        this._discoveryApi = new DiscoveryApi();
        this._pixelCount = size * size;
        this._size = size;
        this._deviceId = deviceId;
        this._macAddress = macAddress;
    }

    public getDiscoveryApi(): DiscoveryApi {
        return this._discoveryApi;
    }

    public async init(): Promise<void> {
        await this.clearText();
        await this.clearBuffer();
    }

    public async playDivoomGif(fileId: string): Promise<void> {
        await this._divoomApi.sendCommand(new SendRemoteCommand(fileId), this._simpleClass);
    }

    public getAllConf(): Promise<AllConfModel> {
        return this._divoomApi.sendCommandImmediatelyAndGet<AllConfModel>(new GetAllConfCommand(), this._simpleClass);
    }

    public getCurrentChannel(): Promise<CurrentChannelResponse> {
        return this._divoomApi.sendCommandImmediatelyAndGet<CurrentChannelResponse>(new GetIndexCommand(), this._simpleClass);
    }

    public async setOnOff(on: boolean): Promise<void> {
        await this._divoomApi.sendCommand(new OnOffScreenCommand(on), this._simpleClass);
    }

    public async selectChannel(channel: ChannelEnum): Promise<void> {
        await this._divoomApi.sendCommand(new SetIndexCommand(channel), this._simpleClass);
    }

    public async setBrightness(brightness: number): Promise<void> {
        await this._divoomApi.sendCommand(new SetBrightnessCommand(brightness), this._simpleClass);
    }

    public async setTimer(status: TimerStatusEnum, minute: number | undefined, second: number | undefined): Promise<void> {
        await this._divoomApi.sendCommand(new SetTimerCommand(status, minute, second), this._simpleClass);
    }

    public async playBuzzer(time: number): Promise<void> {
        await this._divoomApi.sendCommand(new PlayBuzzerCommand(time), this._simpleClass);
    }

    public async fillAndPush(color: string | number[]): Promise<void> {
        await this._sendBuffer(new Array<number[]>(this._pixelCount).fill(this._parseColor(color)));
    }

    public async sendImageAndPush(url: string): Promise<void> {
        await this._sendBuffer(await this._base64ToPixelMatrix(url));
    }

    public async sendGifAndPush(url: string, speed: number): Promise<void> {
        await this._sendGif(await this._gifToPixelMatrix(url), speed);
    }

    public async clearText(): Promise<void> {
        await this._divoomApi.sendCommand(new ClearHttpTextCommand(), this._simpleClass);
        this._textCounter = 0;
    }

    public async clearBuffer(): Promise<void> {
        await this._divoomApi.sendCommand(new ResetHttpGifIdCommand(), this._simpleClass);
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

        await this._divoomApi.sendCommand(
            new SendHttpTextCommand(this._textCounter++, x, y, dir, textWidth, textString, speed, color, align),
            this._simpleClass,
        );
    }

    private async _sendBuffer(buffer: Array<number[]>): Promise<void> {
        if (this._counter >= 1000) {
            await this.clearBuffer();
        }

        await this._divoomApi.sendCommand(
            new SendHttpGifCommand(1, this._size, 0, this._counter++, 1000, Buffer.from(buffer.flat()).toString('base64')),
            this._simpleClass,
        );
    }

    private async _sendGif(frames: Array<Array<number[]>>, speed: number): Promise<void> {
        if (this._counter >= 1000) {
            await this.clearBuffer();
        }

        const counter = this._counter++;
        const commands: DivoomCommand[] = [];
        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            commands.push(
                new SendHttpGifCommand(frames.length, this._size, i, counter, speed, Buffer.from(frame.flat()).toString('base64')),
            );
        }

        await this._divoomApi.sendCommand(new CommandListCommand(commands), this._simpleClass);
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

    private async _base64ToPixelMatrix(url: string): Promise<Array<number[]>> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch image');
        }

        const image = await Jimp.read(Buffer.from(await response.arrayBuffer()));
        image.contain({ h: 64, w: 64 });
        image.background = 0x00000000;

        const pixelArray: number[][] = [];

        // Loop through the pixels and extract RGB values
        for (let y = 0; y < 64; y++) {
            for (let x = 0; x < 64; x++) {
                const color = intToRGBA(image.getPixelColor(x, y));
                pixelArray.push([color.r, color.g, color.b]);
            }
        }

        return pixelArray;
    }

    private async _gifToPixelMatrix(imageUrl: string, maxFrames = 60): Promise<Array<Array<number[]>>> {
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();

        const gif = parseGIF(buffer);
        const frames = decompressFrames(gif, true).slice(0, maxFrames);

        const fullWidth = gif.lsd.width;
        const fullHeight = gif.lsd.height;
        const previousFrame = Buffer.alloc(fullWidth * fullHeight * 4, 0);
        const pixelArrays: Array<Array<number[]>> = [];

        for (const frame of frames) {
            // Patch contains the pixel data, dims contains the frame's size and position
            const { patch, dims } = frame;

            const patchBuffer = Buffer.from(patch);
            for (let y = 0; y < dims.height; y++) {
                for (let x = 0; x < dims.width; x++) {
                    const srcIndex = (y * dims.width + x) * 4;
                    const destX = dims.left + x;
                    const destY = dims.top + y;
                    const destIndex = (destY * fullWidth + destX) * 4;

                    previousFrame[destIndex] = patchBuffer[srcIndex]; // Red
                    previousFrame[destIndex + 1] = patchBuffer[srcIndex + 1]; // Green
                    previousFrame[destIndex + 2] = patchBuffer[srcIndex + 2]; // Blue
                    previousFrame[destIndex + 3] = patchBuffer[srcIndex + 3]; // Alpha
                }
            }

            const jimpImage = new Jimp({
                data: previousFrame,
                width: fullWidth,
                height: fullHeight,
            });

            jimpImage.contain({ h: 64, w: 64 });
            jimpImage.background = 0x00000000;

            const pixelArray = [];
            for (let y = 0; y < 64; y++) {
                for (let x = 0; x < 64; x++) {
                    const color = jimpImage.getPixelColor(x, y);
                    const { r, g, b } = intToRGBA(color);
                    pixelArray.push([r, g, b]);
                }
            }

            pixelArrays.push(pixelArray);
        }

        return pixelArrays;
    }
}
