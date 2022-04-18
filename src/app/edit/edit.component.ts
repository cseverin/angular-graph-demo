import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Event } from '@microsoft/microsoft-graph-types';
import * as moment from 'moment';
import { GraphService } from 'src/service/graph.service';
import { EventBean } from '../beans/event.bean';
import { DateUtil } from '../date.util';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import { AttendeeBean } from '../beans/attendee.bean';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

  data?: EventBean;

  time:string[];

  id?:string;

  readonly separatorKeysCodes = [ENTER, COMMA] as const;


  constructor(private service:GraphService, private route: ActivatedRoute, private router: Router, private _snackBar: MatSnackBar) {

    this.time = [];
    for (let i=0; i<24; i++){
      for (let i2=0; i2<2; i2++){
        this.time.push((i<10 ? '0':'') + i + ':' + (i2==0?'00':'30'));
      }
    }

   }
 
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      let id: string | null = params.get('id');
      if (id != null) {
        this.id = id;
        this._load();
        }else{
          this._new();
        }
      });
  }
  
  _new(){
    let newData:EventBean = new EventBean();
    newData.beginn = moment(new Date());
    newData.ende = moment(DateUtil.add(newData.beginn.toDate(), 'h2'));
    newData._beginnTime = DateUtil.getTimeString(newData.beginn.toDate(), true);
    newData._endeTime = DateUtil.getTimeString(newData.ende.toDate(), true);
    this.data = newData;
  }


  _load(){
    this.data = new EventBean();
    if (this.service.isLoggedIn()){
      this._load0();  
    }else{
      this.service.login(()=>{
        this._load0();
      });
    }
  }

  _load0(){
    if (this.id){
      this.service.getEventById(this.id).then((result:Event)=>{
        this.data?.read(result);
      });
    }

  }

  delete(){
    if (this.data && this.data.id){
      let subject = this.data.betreff;
      
      this.service.deleteEventById(this.data.id).then((result)=>{
        console.log('Delete: ' + result);
        this.openSnackBar(subject + " wurde erfolgreich gelöscht");
        this.router.navigate(['list']);  
       });
      
    }
  }



  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      duration: 3000
    });
  }



  store(){
   
    if (this.data){
      if (this.service.isLoggedIn()){
        this._store();
      }else{
        this.service.login(()=>{
          this._store();
        });
      }
    }
  }

  _store(){
    if (this.data){
      let subject:string |undefined = this.data.betreff;
      this.service.createEvent(this.data, (response:Event)=>{
        this.data?.read(response);
        this.openSnackBar(subject + " wurde erfolgreich gespeichert");
      });
    }
  }

  addParticipant(event: MatChipInputEvent): void {
    let value:string = (event.value || '').trim();

    // Add our fruit
    if (value && this.data) {
      this.data.attendees.push(new AttendeeBean(value, false, false));
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  removeParticipant(value: AttendeeBean): void {
    

    const index:number | undefined = this.data?.attendees.indexOf(value);

    if (index !=null && index >= 0) {
      this.data?.attendees.splice(index, 1);
    }
  }

  changeEnd(){
    this.data?.calcMinutes();
  }

  changeBegin(){
    this.data?.recalcTime();
  }

}
