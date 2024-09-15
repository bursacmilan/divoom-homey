import { SimpleClass } from 'homey';
import { SameLanDevicesResponse } from './same-lan-devices.response';
import { ImgUploadListResponse } from './img-upload-list.response';

export class DiscoveryApi {
    private _lastFetch = 0;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private _allImages: { FileName: string; FileId: string }[] = [];

    public async getDevices(): Promise<SameLanDevicesResponse> {
        const response = await fetch('https://app.divoom-gz.com/Device/ReturnSameLANDevice', { method: 'POST' });
        return JSON.parse(await response.text()) as SameLanDevicesResponse;
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

        const imageList = (JSON.parse(await response.text()) as ImgUploadListResponse).ImgList;
        if (!imageList?.length) {
            return imageList ?? [];
        }

        const nextPage = await this._getAllImages(deviceId, deviceMac, simpleClass, type, page + 1);
        return imageList.concat(nextPage);
    }
}
