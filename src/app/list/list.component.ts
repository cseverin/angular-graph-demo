import { Component, OnInit } from '@angular/core';
import { Event } from '@microsoft/microsoft-graph-types';
import * as moment from 'moment';
import { GraphService } from 'src/service/graph.service';
import { ContainerBean } from '../beans/container.bean';
import { EventBean } from '../beans/event.bean';
import { MonthBean } from '../beans/month.bean';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  //events:EventBean[] = [];

  events: ContainerBean = new ContainerBean();

  start:moment.Moment;
  end:moment.Moment;

  constructor(private service:GraphService) { 
    this.start = moment(new Date()).startOf('month').utc();
    this.end = moment(new Date()).endOf('year').utc();
  }

  ngOnInit(): void {
   this.load();
  }

   
  load(){
    if (this.service.isLoggedIn()){
      this._load();  
    }else{
      this.service.login((result:any)=>{
        if (result){
          this._load();
        }
      }); 
    }
    
  }

  _load(){
    this.service.getEvents(this.start.toDate(), this.end.toDate(), 50)?.then((result)=>{
      this.events.list.splice(0);

      let cursor:moment.Moment = this.start.startOf('week');

      this.events._load(result.value);

      });
      //this.adjustTimeInterval();
  }

  more(){
    
  }

  /*
  adjustTimeInterval(){
    let start:moment.Moment = this.start;
    let end: moment.Moment = this.end;
    
    for (let item of this.events){
      if (item.beginn?.isBefore(start)){
        start = item.beginn;
      }
      if (item.ende?.isAfter(end)){
        end = item.ende;
      }
    }
    this.start = start;
    this.end = end;
  }
  */

}
