import { DivoomCommand } from '../divoom/divoom-command';

export class SendHttpGifCommand extends DivoomCommand {
    public picNum: number;
    public picWidth: number;
    public picOffset: number;
    public picId: number;
    public picSpeed: number;
    public picData: string;

    constructor(picNum: number, picWidth: number, picOffset: number, picId: number, picSpeed: number, picData: string) {
        super('Draw/SendHttpGif');
        this.picNum = picNum;
        this.picWidth = picWidth;
        this.picOffset = picOffset;
        this.picId = picId;
        this.picSpeed = picSpeed;
        this.picData = picData;
    }
}
