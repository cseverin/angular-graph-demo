import { Component, OnInit } from '@angular/core';
import { Event } from '@microsoft/microsoft-graph-types';
import { GraphService } from 'src/service/graph.service';
import { EventBean } from '../beans/event.bean';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  events:EventBean[] = [];

  constructor(private service:GraphService) { }

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
    this.service.getEvents()?.then((result)=>{
      this.events.splice(0);
      for (let item of result.value){
        console.log('RESULT: ' + JSON.stringify(item));
        let ev:EventBean = new EventBean().read(item);
        this.events.push(ev);
      }
    });
  }

}
