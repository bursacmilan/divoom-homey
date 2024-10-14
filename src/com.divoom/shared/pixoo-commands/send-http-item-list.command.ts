import { DivoomCommand } from '../divoom/divoom-command';
import { TextItem } from './models/text-item';

export class SendHttpItemListCommand extends DivoomCommand {
    public itemList: TextItem[];

    constructor(textItems: TextItem[]) {
        super('Draw/SendHttpItemList');
        this.itemList = textItems;

        for (let i = 0; i < textItems.length; i++) {
            this.itemList[i].textId = i + 1;
        }
    }
}
