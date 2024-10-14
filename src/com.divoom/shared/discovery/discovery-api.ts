import { SimpleClass } from 'homey';
import { SameLanDevicesResponse } from './same-lan-devices.response';

export class DiscoveryApi {
    private _lastFetch = 0;
    private _lastFetchFont = 0;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    private _allImages: { FileName: string; FileId: string }[] = [];
    private _allFonts: { id: number; type: number; name: string; width: number; high: number; displayText: string }[] = [];

    public async getDevices(): Promise<SameLanDevicesResponse> {
        const response = await fetch('https://app.divoom-gz.com/Device/ReturnSameLANDevice', { method: 'POST' });
        return JSON.parse(await response.text()) as SameLanDevicesResponse;
    }

    public async getAllFonts(
        simpleClass: SimpleClass,
    ): Promise<{ id: number; type: number; name: string; width: number; high: number; displayText: string }[]> {
        if ((Date.now() - this._lastFetchFont) / 1000 / 60 / 60 / 24 < 24) {
            simpleClass.log(`Returning cached fonts (${Date.now() - this._lastFetchFont})`, this._allFonts.length);
            return this._allFonts;
        }

        this._allFonts = await this._getAllFonts(simpleClass);
        this._lastFetchFont = Date.now();
        return this._allFonts;
    }

    public async getAllImages(
        deviceId: string,
        deviceMac: string,
        simpleClass: SimpleClass,
        // eslint-disable-next-line @typescript-eslint/naming-convention
    ): Promise<{ FileName: string; FileId: string }[]> {
        if (Date.now() - this._lastFetch < 30000) {
            simpleClass.log(`Returning cached images (${Date.now() - this._lastFetch})`);
            return this._allImages;
        }

        let images = await this._getAllImages(deviceId, deviceMac, simpleClass, 'GetImgUploadList');
        images = images.concat(await this._getAllImages(deviceId, deviceMac, simpleClass, 'GetImgLikeList'));

        simpleClass.log(images);

        this._allImages = images;
        this._lastFetch = Date.now();

        return images;
    }

    private async _getAllImages(
        deviceId: string,
        deviceMac: string,
        simpleClass: SimpleClass,
        type: 'GetImgUploadList' | 'GetImgLikeList',
        page = 1,
        // eslint-disable-next-line @typescript-eslint/naming-convention
    ): Promise<{ FileName: string; FileId: string }[]> {
        const response = await fetch(`https://app.divoom-gz.com/Device/${type}`, {
            method: 'POST',
            body: JSON.stringify({ DeviceId: deviceId, DeviceMac: deviceMac, Page: page }),
        });

        simpleClass.log(`Response-Code from getAllImages: ${response.status}`);

        // eslint-disable-next-line @typescript-eslint/naming-convention
        const imageList = (JSON.parse(await response.text()) as { ImgList?: { FileName: string; FileId: string }[] }).ImgList;
        if (!imageList?.length) {
            return imageList ?? [];
        }

        const nextPage = await this._getAllImages(deviceId, deviceMac, simpleClass, type, page + 1);
        return imageList.concat(nextPage);
    }

    private async _getAllFonts(
        simpleClass: SimpleClass,
        // eslint-disable-next-line @typescript-eslint/naming-convention
    ): Promise<{ id: number; type: number; name: string; width: number; high: number; displayText: string }[]> {
        const response = await fetch('https://app.divoom-gz.com/Device/GetTimeDialFontList', {
            method: 'GET',
        });

        simpleClass.log(`Response-Code from getTimeDialFontList: ${response.status}`);

        const fontList = JSON.parse(await response.text()) as {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            FontList: { id: number; type: number; name: string; width: number; high: number; displayText: string }[];
        };

        fontList.FontList.forEach(font => {
            const scrollableText = font.type === 0 ? ' scrollable' : '';
            font.displayText = `${font.name} (${font.width}x${font.high})${scrollableText}`;
        });

        return fontList.FontList ?? [];
    }
}
