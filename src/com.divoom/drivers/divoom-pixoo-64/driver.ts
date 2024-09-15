import Homey from 'homey';
import { PairingDevice } from '../../shared/pairing-device';
import { Pixoo64Device } from './device';
import { TextScrollEnum } from '../../shared/pixoo-commands/models/text-scroll.enum';
import { TextAlignEnum } from '../../shared/pixoo-commands/models/text-align.enum';
import { DiscoveryApi } from '../../shared/discovery/discovery-api';

class Pixoo64Driver extends Homey.Driver {
    public onInit(): Promise<void> {
        this.homey.flow
            .getActionCard('set_timer')
            .registerRunListener(async (args: { device: Pixoo64Device; minutes: number; seconds: number }) => {
                await args.device.startTimer(args.minutes ?? 0, args.seconds ?? 0);
            });

        this.homey.flow.getActionCard('stop_timer').registerRunListener(async (args: { device: Pixoo64Device }) => {
            await args.device.stopTimer();
        });

        this.homey.flow.getActionCard('fill_screen').registerRunListener(async (args: { device: Pixoo64Device; hex: string }) => {
            await args.device.fillScreen(args.hex);
        });

        this.homey.flow.getActionCard('clear_text').registerRunListener(async (args: { device: Pixoo64Device }) => {
            await args.device.clearText();
        });

        this.homey.flow.getActionCard('send_image').registerRunListener(async (args: { device: Pixoo64Device; url: string }) => {
            await args.device.sendImageAndPush(args.url);
        });

        this.homey.flow
            .getActionCard('send_gif')
            .registerRunListener(async (args: { device: Pixoo64Device; url: string; speed: number }) => {
                await args.device.sendGifAndPush(args.url, args.speed);
            });

        this.homey.flow
            .getActionCard('draw_text')
            .registerRunListener(
                async (args: {
                    device: Pixoo64Device;
                    text: string;
                    x: number;
                    y: number;
                    direction: string;
                    textWidth: number;
                    speed: number;
                    color: string;
                    align: string;
                    clear: boolean;
                }) => {
                    await args.device.drawText(
                        args.x,
                        args.y,
                        +args.direction as TextScrollEnum,
                        args.textWidth,
                        args.text,
                        args.speed,
                        args.color,
                        +args.align as TextAlignEnum,
                        args.clear,
                    );
                },
            );

        return Promise.resolve();
    }

    public async onPairListDevices(): Promise<PairingDevice[]> {
        const devices = await new DiscoveryApi().getDevices();
        return devices.DeviceList.map(
            device => new PairingDevice(device.DeviceName, { id: device.DeviceId }, { ipAddress: device.DevicePrivateIP }),
        );
    }
}

module.exports = Pixoo64Driver;
