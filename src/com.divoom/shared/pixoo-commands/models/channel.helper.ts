import { ChannelEnum } from './channel.enum';

export class ChannelHelper {
    public static homeyChannelToDivoomChannel(homeyChannel: string): ChannelEnum | undefined {
        let valueAsEnum: ChannelEnum | undefined;
        switch (homeyChannel) {
            case 'channel_0':
                valueAsEnum = ChannelEnum.Faces;
                break;
            case 'channel_1':
                valueAsEnum = ChannelEnum.CloudChannel;
                break;
            case 'channel_2':
                valueAsEnum = ChannelEnum.Visualizer;
                break;
            case 'channel_3':
                valueAsEnum = ChannelEnum.Custom;
                break;
            case 'channel_4':
                valueAsEnum = ChannelEnum.BlackScreen;
                break;
            default:
                valueAsEnum = undefined;
                break;
        }

        return valueAsEnum;
    }

    public static divoomChannelToHomeyChannelOrDefault(divoomChannel: ChannelEnum): string {
        switch (divoomChannel) {
            case ChannelEnum.Faces:
                return 'channel_0';
            case ChannelEnum.CloudChannel:
                return 'channel_1';
            case ChannelEnum.Visualizer:
                return 'channel_2';
            case ChannelEnum.Custom:
                return 'channel_3';
            case ChannelEnum.BlackScreen:
                return 'channel_4';
            default:
                return 'channel_0';
        }
    }
}
