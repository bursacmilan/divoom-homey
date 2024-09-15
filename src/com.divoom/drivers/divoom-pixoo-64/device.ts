import Homey from 'homey';
import { Capabilities } from '../../shared/capabilities';
import { TimerStatusEnum } from '../../shared/pixoo-commands/models/timer-status.enum';
import { ChannelEnum } from '../../shared/pixoo-commands/models/channel.enum';
import { ChannelHelper } from '../../shared/pixoo-commands/models/channel.helper';
import { Pixoo } from '../../shared/divoom/pixoo';
import { TextScrollEnum } from '../../shared/pixoo-commands/models/text-scroll.enum';
import { TextAlignEnum } from '../../shared/pixoo-commands/models/text-align.enum';

export class Pixoo64Device extends Homey.Device {
    private _pixoo?: Pixoo;

    public async onInit(): Promise<void> {
        this._sendCommandList();

        const ipAddress = this.getSetting('ipAddress') as string;
        const deviceId = this.getSetting('deviceId') as string;
        const macAddress = this.getSetting('macAddress') as string;

        if (!ipAddress || !deviceId || !macAddress) {
            this._pixoo = undefined;
            return;
        }

        this.log(`ipAddress: ${ipAddress}, deviceId: ${deviceId}, macAddress: ${macAddress}`);
        this._pixoo = new Pixoo(ipAddress, deviceId, macAddress, this, 64);
        await this._pixoo.init();

        const currentState = await this._pixoo.getAllConf();
        const currentChannel = await this._pixoo.getCurrentChannel();
        await this.setCapabilityValue(Capabilities.channel, ChannelHelper.divoomChannelToHomeyChannelOrDefault(currentChannel.SelectIndex));
        await this.setCapabilityValue(Capabilities.onOff, currentState.LightSwitch !== 0);
        await this.setCapabilityValue(Capabilities.dim, currentState.Brightness / 100);

        this.registerCapabilityListener(Capabilities.onOff, async value => {
            const valueAsBool = value as boolean;
            await this._pixoo?.setOnOff(valueAsBool);
        });

        this.registerCapabilityListener(Capabilities.dim, async value => {
            const valueAsNumber = value as number;
            await this._pixoo?.setBrightness(Math.round(valueAsNumber * 100));
        });

        this.registerCapabilityListener(Capabilities.channel, async value => {
            await this.setChannel(value as string);
        });
    }

    private _sendCommandList(): void {
        this.homey.setInterval(async () => {
            if (!this._pixoo) {
                return;
            }

            try {
                await this._pixoo.sendCurrentCommandList();
            } catch (_) {}
        }, 500);
    }

    public async setChannel(homeyChannel: string): Promise<void> {
        const valueAsChannel = ChannelHelper.homeyChannelToDivoomChannel(homeyChannel);
        await this._pixoo?.selectChannel(valueAsChannel ?? ChannelEnum.Faces);
    }

    public async startTimer(minutes: number, seconds: number): Promise<void> {
        await this._pixoo?.setTimer(TimerStatusEnum.Start, minutes, seconds);
    }

    public async fillScreen(hex: string): Promise<void> {
        await this._pixoo?.fillAndPush(hex);
    }

    public async clearText(): Promise<void> {
        await this._pixoo?.clearText();
    }

    public async sendImageAndPush(url: string): Promise<void> {
        await this._pixoo?.sendImageAndPush(url);
    }

    public async sendGifAndPush(url: string, speed: number): Promise<void> {
        await this._pixoo?.sendGifAndPush(url, speed);
    }

    public async playDivoomGif(name: string): Promise<void> {
        await this._pixoo?.playDivoomGif(name);
    }

    public async playBuzzer(time: number): Promise<void> {
        await this._pixoo?.playBuzzer(time);
    }

    public async drawText(
        x: number,
        y: number,
        textScrollDirection: TextScrollEnum,
        textWidth: number,
        textString: string,
        textScrollSpeed: number,
        textColor: string,
        textAlignment: TextAlignEnum,
        clearCurrentText: boolean,
    ): Promise<void> {
        await this._pixoo?.drawText(
            x,
            y,
            textScrollDirection,
            textWidth,
            textString,
            textScrollSpeed,
            textColor,
            textAlignment,
            clearCurrentText,
        );
    }

    public async stopTimer(): Promise<void> {
        await this._pixoo?.setTimer(TimerStatusEnum.Stop, 0, 0);
    }

    public async onSettings({
        newSettings,
    }: {
        oldSettings: { [key: string]: boolean | string | number | undefined | null };
        newSettings: { [key: string]: boolean | string | number | undefined | null };
        changedKeys: string[];
    }): Promise<string | void> {
        const ipAddress = newSettings['ipAddress'] as string;
        const deviceId = newSettings['deviceId'] as string;
        const macAddress = newSettings['macAddress'] as string;

        if (!ipAddress || !deviceId || !macAddress) {
            this._pixoo = undefined;
            return;
        }

        this._pixoo = new Pixoo(ipAddress, deviceId, macAddress, this, 64);
        await this._pixoo.init();
    }
}

module.exports = Pixoo64Device;
