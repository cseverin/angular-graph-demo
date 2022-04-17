import * as moment from "moment";
import { Moment } from "moment";
import { WeekBean } from "./week.bean";

export class MonthBean{
    list: WeekBean[] = [];
    date:Date;

    label:string = '';

    constructor(date:Date){
        this.date = moment(date).startOf('month').utc().toDate();
        this.label = moment(this.date).format('MMM YYYY');
    }

    findWeek(date:Date): WeekBean | null{
        let date0:Moment = moment(date).startOf('week').utc();
        for (let week of this.list){
            let weekDate0:Moment = moment(week.date);
            if (weekDate0.isSame(date0)){
                return week;
            }
        }    
        return null;
    }

}