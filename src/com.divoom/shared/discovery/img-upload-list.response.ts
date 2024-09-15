import { DivoomResponse } from '../divoom/divoom-response';

export interface ImgUploadListResponse extends DivoomResponse {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ImgList?: { FileName: string; FileId: string }[];
}
