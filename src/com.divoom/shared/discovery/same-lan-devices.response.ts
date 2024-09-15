import { DivoomResponse } from '../divoom/divoom-response';

export interface SameLanDevicesResponse extends DivoomResponse {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    DeviceList: { DeviceName: string; DeviceId: string; DevicePrivateIP: string; DeviceMac: string }[];
}
