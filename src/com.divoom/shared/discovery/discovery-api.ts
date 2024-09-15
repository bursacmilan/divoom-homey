import { SameLanDevicesResponse } from './same-lan-devices.response';

export class DiscoveryApi {
    public async getDevices(): Promise<SameLanDevicesResponse> {
        const response = await fetch('https://app.divoom-gz.com/Device/ReturnSameLANDevice', { method: 'POST' });
        return JSON.parse(await response.text()) as SameLanDevicesResponse;
    }
}
