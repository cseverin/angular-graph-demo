import * as moment from "moment";
import { EventBean } from "./event.bean";

export class WeekBean{

    list:EventBean[] = [];

    date:Date;

    label:string = '';

    constructor(date:Date){
        this.date = moment(date).startOf('week').utc().toDate();
        this.label = 'KW ' + moment(this.date).format('WW') + ' - ' + moment(this.date).format('DD.MM.YYYY') + ' bis ' + moment(this.date).endOf('week').utc().format('DD.MM.YYYY');
    }

}