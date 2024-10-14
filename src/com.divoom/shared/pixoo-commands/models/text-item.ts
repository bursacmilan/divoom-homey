export class TextItem {
    public textId: number = 0;
    public type: number;
    public x: number;
    public y: number;
    public dir: number;
    public font: number;
    public textWidth: number;
    public textHeight: number;
    public textString: string; // Max 512 characters
    public speed: number; // 1 - 100
    public color: string;
    public align: number; // 1 = left, 2 = middle, 3 = right

    constructor(
        type: number,
        x: number,
        y: number,
        dir: number,
        font: number,
        textWidth: number,
        textHeight: number,
        textString: string,
        speed: number,
        color: string,
        align: number,
    ) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.font = font;
        this.textWidth = textWidth;
        this.textHeight = textHeight;
        this.textString = textString;
        this.speed = speed;
        this.color = color;
        this.align = align;

        if (!this.color.startsWith('#')) {
            this.color = `#${color}`;
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
