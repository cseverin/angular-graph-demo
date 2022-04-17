import { Event } from "@microsoft/microsoft-graph-types";
import * as moment from "moment";
import { EventBean } from "./event.bean";
import { MonthBean } from "./month.bean";
import { WeekBean } from "./week.bean";

export class ContainerBean {

    list:MonthBean[] = [];

    constructor(){

    }

    findMonth(date:Date): MonthBean |null{
        let date0:moment.Moment = moment(date).startOf('month').utc();
        for (let month of this.list){
            let monthDate0:moment.Moment = moment(month.date);
            if (monthDate0.isSame(date0)){
                return month;
            }
        }    
        return null;        
    }


    _load(events: Event[]){
        
          for (let item of events){
            let ev:EventBean = new EventBean().read(item);
            if (ev.beginn){
                let date:Date =ev.beginn.toDate();
                let month:MonthBean|null = this.findMonth(date)
                if (month==null){
                    month =new MonthBean(date);
                    this.list.push(month);
                }
                let week:WeekBean|null = month.findWeek(date);
                if (week == null){
                    week = new WeekBean(date);
                    month.list.push(week);
                }
                let event:EventBean | undefined = week.list.find((item)=>{
                    return item.id == ev.id;
                });
                if (event == undefined){
                    week.list.push(ev);
                }
            }
            
          }
    }

}