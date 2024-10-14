import { DivoomCommand } from '../divoom/divoom-command';
import { TextScrollEnum } from './models/text-scroll.enum';
import { TextAlignEnum } from './models/text-align.enum';

export class SendHttpTextCommand extends DivoomCommand {
    public textId: number;
    public x: number;
    public y: number;
    public dir: TextScrollEnum;
    public font: number;
    public textWidth: number;
    public textString: string;
    public speed: number;
    public color: string;
    public align: TextAlignEnum;

    constructor(
        textId: number,
        x: number,
        y: number,
        dir: TextScrollEnum,
        textWidth: number,
        textString: string,
        speed: number,
        color: string,
        align: TextAlignEnum,
        font: number,
    ) {
        super('Draw/SendHttpText');
        this.textId = textId;
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.font = font;
        this.textWidth = textWidth;
        this.textString = textString;
        this.speed = speed;
        this.color = color;
        this.align = align;

        if (!this.color.startsWith('#')) {
            this.color = `#${color}`;
        }

        if (this.textWidth < 16) {
            this.textWidth = 16;
        } else if (this.textWidth >= 64) {
            this.textWidth = 63;
        }

        if (this.textString.length >= 512) {
            this.textString = this.textString.substring(0, 511);
        }

        if (this.speed < 1) {
            this.speed = 1;
        } else if (this.speed > 100) {
            this.speed = 100;
        }
    }
}
