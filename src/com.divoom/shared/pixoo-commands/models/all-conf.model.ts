import { DivoomResponse } from '../../divoom/divoom-response';

export interface AllConfModel extends DivoomResponse {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    LightSwitch: number;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Brightness: number;
}
