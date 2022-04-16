import { Event, Attendee } from "@microsoft/microsoft-graph-types";
import * as moment from "moment";
import { Moment } from "moment";
import { DateUtil } from "../date.util";

export class EventBean {

    id?: string;

    betreff?: string;

    text?: string;

    beginn?: Moment;
    _beginnTime?: string;

    ende?: Moment;
    _endeTime?: string;

    organizer?: string;

    teilnehmer: string[] = [];

    constructor() {

    }

    read(e: Event): EventBean {
        this.betreff = e.subject?.toString();
        console.log("Betreff: " + this.betreff);
        this.id = e.id;

        let date1: Date | null = e.start && e.start.dateTime ? DateUtil.stringToDate(e.start.dateTime.valueOf()) : null;
        let date2: Date | null = e.end && e.end.dateTime ? DateUtil.stringToDate(e.end.dateTime.valueOf()) : null;

        if (date1) {
            this.beginn = moment(date1);
            this._beginnTime = DateUtil.getTimeString(date1);
        }
        if (date2) {
            this.ende = moment(date2);
            this._endeTime = DateUtil.getTimeString(date2);
        }
        if (e.organizer && e.organizer.emailAddress && e.organizer.emailAddress.name) {
            this.organizer = e.organizer.emailAddress.name?.toString();
        }

        if (e.body && e.body.content) {
            this.text = e.body.content.toString();
        }

        this.teilnehmer.splice(0);
        if (e.attendees){
            for (let att of e.attendees){
                if (att.emailAddress && att.emailAddress.name){
                    this.teilnehmer.push(att.emailAddress.name.toString());
                }
            }
        }

        return this;
    }

    write(ianaTimeZone: string): Event {


        let beginn: string | null = this.beginn ? DateUtil.dateToString(this.beginn.toDate()) + 'T' + this._beginnTime : null;
        let ende: string | null = this.ende ? DateUtil.dateToString(this.ende.toDate()) + 'T' + this._endeTime : null;


        let attendees: Attendee[] = [];
        if (this.teilnehmer && this.teilnehmer.length > 0) {

            for (let teiln of this.teilnehmer) {
                if (teiln.length > 0) {

                    let teiln0 = {
                        type: 'required',
                        emailAddress: {
                            address: teiln
                        }
                    };
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
            attendees: attendees
        };

        // Body
        newEvent.body = {
            contentType: 'text',
            content: this.text
        };




        return <Event>newEvent;


    }

}