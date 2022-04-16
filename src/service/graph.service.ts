import { EventEmitter, Injectable } from '@angular/core';
import { AccountInfo, InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider, AuthCodeMSALBrowserAuthenticationProviderOptions } from "@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser";
import { Event, User } from '@microsoft/microsoft-graph-types';
import * as moment from 'moment';
import * as tz from "moment-timezone";
import { EventBean } from 'src/app/beans/event.bean';
import { DateUtil } from 'src/app/date.util';

const msalConfig = {
  auth: {
    clientId: '9b77de69-e75b-4486-9aed-2c8b1522b2d0',
    redirectUri: 'http://localhost:4200'
  }
};

const msalRequest = {
  scopes: [
    'user.read',
    'mailboxsettings.read',
    'calendars.readwrite'
  ]
};


@Injectable({
  providedIn: 'root'
})
export class GraphService {

  msalClient: PublicClientApplication = new PublicClientApplication(msalConfig);

  client?: Client;

  constructor() { }


  login(callback: any): void {
    try {
      // Use MSAL to login
      this.msalClient.loginPopup(msalRequest).then((authResult) => {
        console.log('id_token acquired at: ' + new Date().toString());
        this.msalClient.setActiveAccount(authResult.account);
        if (authResult.account) {
          this.client = this.initializeGraphClient(authResult.account, msalRequest.scopes);
          // Get the user's profile from Graph
          this.getUser(this.client).then((user) => {
            // Save the profile in session
            sessionStorage.setItem('graphUser', JSON.stringify(user));
            console.log('Authentication done');
            callback(user);
          });

        } else {
          callback(null);
        }
      });

    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }

  isLoggedIn(): boolean {
    let userString: string | null = sessionStorage.getItem('graphUser');
    return userString != null && this.client != undefined;
  }


  initializeGraphClient(account: AccountInfo, scopes: string[]): Client {
    // Create an authentication provider
    const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(this.msalClient, {
      account: account,
      scopes: scopes,
      interactionType: InteractionType.Popup
    });
    let client: Client = Client.initWithMiddleware({ authProvider });

    // Initialize the Graph client
    return client;
  }

  getUser(client: Client): Promise<any> {
    // Only get the fields used by the app
    return client.api('/me').select('id,displayName,mail,userPrincipalName,mailboxSettings').get();
  }


  getEvents(): Promise<any> {
    let userString: string | null = sessionStorage.getItem('graphUser');
    if (userString && this.client) {
      let userObj = JSON.parse(userString);
      let ianaTimeZone: string = this.getTimezone(userObj);
      let startOfWeek = moment(new Date()).startOf('week').utc();
      let endOfWeek = moment(startOfWeek).add(7, 'day');
      return this.client.api('/me/calendarview')
        // Set the Prefer=outlook.timezone header so date/times are in
        // user's preferred time zone
        .header("Prefer", `outlook.timezone="${ianaTimeZone}"`)
        // Add the startDateTime and endDateTime query parameters
        .query({ startDateTime: startOfWeek.format(), endDateTime: endOfWeek.format() })
        // Select just the fields we are interested in
        .select('subject,organizer,start,end')
        // Sort the results by start, earliest first
        .orderby('start/dateTime')
        // Maximum 50 events in response
        .top(50)
        .get();

    } else {
      return new Promise((resolve) => {
        resolve(null);
      });
    }

  }

  createEvent(eventBean: EventBean, callback:any) {

    let userStr: string | null = sessionStorage.getItem('graphUser');
    if (this.client && userStr && eventBean.beginn && eventBean.ende) {
      let userObj: User = JSON.parse(userStr);
      let ianaTimeZone: string = this.getTimezone(userObj);

      let newEvent:Event = eventBean.write(ianaTimeZone);

      let url:string = '/me/events';
      if (eventBean.id){
        url+='/' + eventBean.id;
      
      // Patch
      this.client.api(url).patch(newEvent).then((response)=>{
          callback(response);
      });

      }else{
        // Post
        this.client.api(url).post(newEvent).then((response)=>{
          callback(response);
         });
      }
    }
  }

  getTimezone(user: any): string {
    let timezone: string | null = user.mailboxSettings.timeZone;
    if (timezone) {
      console.log('Timezone:' + timezone);
      return timezone;
    } else {
      return 'US/Aleutian';
    }
  }


  getEventById(id:string): Promise<any> {
    if (this.client) {
      return this.client.api('/me/events/' + id).get();
    } else {
      return new Promise((resolve) => {
        resolve(null);
      });
    }
  }

  deleteEventById(id:string): Promise<any> {
    if (this.client) {
      return this.client.api('/me/events/' + id).delete();
    } else {
      throw 'deleteEventById: no active client';
    }
  }

}
