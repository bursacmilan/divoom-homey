import { DivoomResponse } from './divoom-response';

export class DivoomResponseHelper {
    public static isErrorResponse(response: DivoomResponse): boolean {
        return response.error_code !== 0;
    }
}
