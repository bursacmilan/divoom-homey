import { PairingDeviceData } from './paring-device-data';

export class PairingDevice {
    public readonly name: string;
    public readonly data: PairingDeviceData;
    public readonly settings: { ipAddress: string };

    constructor(name: string, data: PairingDeviceData, settings: { ipAddress: string }) {
        this.name = name;
        this.data = data;
        this.settings = settings;
    }
}
