import { Event, Attendee } from "@microsoft/microsoft-graph-types";
import * as moment from "moment";
import { Moment } from "moment";
import { DateUtil } from "../date.util";
import { AttendeeBean } from "./attendee.bean";

export class EventBean {

    id?: string;

    betreff?: string;

    text?: string;

    beginn?: Moment;
    _beginnTime?: string;

    ende?: Moment;
    _endeTime?: string;

    organizer?: string;

    headline: boolean = false;

    allDay:boolean = false;

    attendees: AttendeeBean[] = [];

    _minutes:number=0;

    onlineMeeting: boolean = false;
    onlineMeetingJoinUrl?:string;
    onlineMeetingConferenceId?:string;

    _numberDays: number = 0;

    constructor() {

    }

    read(e: Event): EventBean {
        this.betreff = e.subject?.toString();
        this.id = e.id;

        let date1: Date | null = e.start && e.start.dateTime ? DateUtil.stringToDate(e.start.dateTime.valueOf()) : null;
        let date2: Date | null = e.end && e.end.dateTime ? DateUtil.stringToDate(e.end.dateTime.valueOf()) : null;

        if (e.isAllDay){
            this.allDay = e.isAllDay;
        }

        if (date1) {
            this.beginn = moment(date1);
            this._beginnTime = DateUtil.getTimeString(date1);
        }
        if (date2) {
            this.ende = this.allDay ? moment(date2).add(-1, 'day'):moment(date2);
            this._endeTime = DateUtil.getTimeString(date2);
        }
        if (e.organizer && e.organizer.emailAddress && e.organizer.emailAddress.name) {
            this.organizer = e.organizer.emailAddress.name?.toString();
        }

        if (this.beginn && this.ende){
            this._numberDays = this.ende.diff(this.beginn, 'day');
        }

        if (e.body && e.body.content) {
            this.text = e.body.content.toString();
        }


        this.attendees.splice(0);
        if (e.attendees){
            for (let att of e.attendees){
                if (att.emailAddress && att.emailAddress.name && att.status){
                    let status:string | undefined = att.status.response?.toString();
                    let accepted:boolean = 'accepted' == status;
                    let declined: boolean = 'declined' == status;
                    let bean:AttendeeBean = new AttendeeBean(att.emailAddress.name.toString(), accepted, declined);
                    this.attendees.push(bean);
                }
            }
        }

        if (e.isOnlineMeeting && e.onlineMeeting){
            this.onlineMeeting = true;
            this.onlineMeetingJoinUrl = e.onlineMeeting.joinUrl?.toString();
            this.onlineMeetingConferenceId = e.onlineMeeting.conferenceId?.toString();
        }else{
            this.onlineMeeting = false;
        }

        this.calcMinutes();

        return this;
    }

    write(ianaTimeZone: string): Event {

    

        let beginn: string | null = this.beginn ? DateUtil.dateToString(this.beginn.toDate()) + 'T' + (this.allDay ? '00:00' : this._beginnTime) : null;
        let ende: string | null = this.ende ? DateUtil.dateToString(this.allDay ? this.ende.add(1, 'day').toDate():this.ende.toDate()) + 'T' + (this.allDay ? '00:00' : this._endeTime) : null;


        let attendees: Attendee[] = [];
        if (this.attendees && this.attendees.length > 0) {

            for (let teiln of this.attendees) {
                if (teiln.emailAddress.length > 0) {
                    let teiln0 = {
                        type: 'required',
                        emailAddress: {
                            address: teiln.emailAddress
                        }
                    }
                    attendees.push(<Attendee>teiln0);
                }
            }
        }

        let newEvent = {
            id: this.id,
            subject: this.betreff,
            start: {
                dateTime: beginn,
                timeZone: ianaTimeZone
            },
            end: {
                dateTime: ende,
                timeZone: ianaTimeZone
            },
            body: {},
            attendees: attendees,
            isOnlineMeeting: this.onlineMeeting,
            isAllDay: this.allDay,
            onlineMeeting:{}
        };


        // Body
        newEvent.body = {
            contentType: 'text',
            content: this.text
        };

        // Online Meeting
        newEvent.onlineMeeting = {
            conferenceId: this.onlineMeetingConferenceId,
            joinUrl: this.onlineMeetingJoinUrl
        }

        return <Event>newEvent;


    }

    calcMinutes(){
        let beginnStr:string = this.beginn?.format('DD.MM.YYYY') + '' + (this.allDay ? '00:00':this._beginnTime);
        let beginn:Moment = moment(beginnStr, 'DD.MM.YYYY H:m');
        let endeStr:string = this.ende?.format('DD.MM.YYYY') + '' + (this.allDay ? '00:00' : this._endeTime);
        let ende:Moment = moment(endeStr, 'DD.MM.YYYY H:m');
        this._minutes = ende.diff(beginn, 'minute');
        console.log('Minutes: ' + this._minutes); 
    }

    recalcTime(){
        let beginnStr:string = this.beginn?.format('DD.MM.YYYY') + '' + (this.allDay ? '00:00' :this._beginnTime);
        let beginn:Moment = moment(beginnStr, 'DD.MM.YYYY H:m');
        let ende:Moment = moment(beginn.toDate()).add(this._minutes, 'minute');
        if (this.allDay)ende.add(1, 'day');
        this._endeTime = ende.format('HH:mm');
        this.ende = ende.startOf('day');
        
        console.log('Date:' + this.ende.toDate());
        console.log('Time: ' + this._endeTime);
    }

}