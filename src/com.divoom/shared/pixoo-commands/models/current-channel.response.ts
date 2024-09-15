import { DivoomResponse } from '../../divoom/divoom-response';
import { ChannelEnum } from './channel.enum';

export interface CurrentChannelResponse extends DivoomResponse {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    SelectIndex: ChannelEnum;
}
