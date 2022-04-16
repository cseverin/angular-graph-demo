

export class DateUtil {

    static stringToDate(datetime: string): Date | null {
        console.log('STRTODATE: ' + datetime);
        if (datetime != null) {
            let date = datetime.substring(0, 10);
            let time = datetime.length > 10 ? datetime.substring(11) : null;

            let year: number = parseInt(date.substring(0, 4));
            let month: number = parseInt(date.substring(5, 7));
            let day: number = parseInt(date.substring(8, 10));

            if (time != null) {
                let hour: number = parseInt(time.substring(0, 2));
                let min: number = parseInt(time.substring(3, 5));
                return new Date(year, month - 1, day, hour, min, 0, 0);
            } else {
                return new Date(year, month - 1, day, 0, 0, 0, 0);
            }
        } else {
            return null;
        }

    }

    static dateToStringAndTimeString(date:Date, separator:string='T'): string | null{
        let str1:string | null =  DateUtil.dateToString(date);
        let str2:string | null = DateUtil.dateToTimeString(date);
        if (str1 && str2){
            return str1 + separator + str2;
        }else{
            return null;
        }
    }

    static dateToString(date: Date): string | null {
        if (date != null) {
            let year: number = date.getFullYear();
            let month: number = date.getMonth() + 1;
            let day: number = date.getDate();
            return year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
        } else {
            return null;
        }
    }

    static dateToTimeString(date: Date): string {
        let hour = date.getUTCHours();
        let min = date.getUTCMinutes();
        return (hour < 10 ? '0' : '') + hour + ':' + (min < 10 ? '0' : '') + min;
    }

    static calcTimeSpan(d1: Date, d2: Date): number {
        let t1 = d1.getTime();
        let t2 = d2.getTime();
        let result = Math.round((t2 - t1) / (1000 * 60 * 60));
        return result > 0 ? result : 1;
    }


    static dateToCompleteString(date: Date): string {
        return DateUtil.dateToString(date) + ' ' + DateUtil.dateToTimeString(date);
    }

    static addDays(date: Date, days: number): Date {
        let d0: Date = new Date(date);
        d0.setDate(date.getDate() + days);
        return d0;
    }



    static add(date:Date, value:string):Date{
        console.log(Number(value.substring(1)));
        if (value.indexOf('d')>=0){
            console.log('ADD DAYS: ' + Number(value.substring(1)));
            console.log('ADD DAYS: ' + this.addDays(date, Number(value.substring(1))));
            
            return this.addDays(date, Number(value.substring(1)));
        }else if (value.indexOf('h')>=0){
            return this.addHours(date, Number(value.substring(1)));
        }else{
            throw "Cannot add value to date: " + value;
        }
    }

    static isMehrtaegig(value:string):boolean{
        if (value.indexOf('d')>=0){
            return Number(value.substring(1)) > 1;
        }else{
            return false;
        }
        
    }

    static hoursDiff(value1:string, value2:string): number{
        console.log('>> V1: ' + value1);    
        console.log('>> V1: ' + value2);    
        let v1: number = Number(value1.substring(0,2)) * 60  + Number(value1.substring(3));
        let v2: number = Number(value2.substring(0,2)) * 60  + Number(value2.substring(3));
        console.log('DIFFX: ' + v1 + '>' + (v1-v2));
        return v1-v2;
    }

    static MinutesDiff(value1:string, value2:string): number{
        console.log('>> ' + Number(value2.substring(0,2)));
        console.log('>> ' + Number(value1.substring(0,2)));
        return Number(value1.substring(0,2)) - Number(value2.substring(0,2));
    }

    static addHours(date:Date, hours:number):Date{
        let d0: Date = new Date(date);
        d0.setHours(date.getHours() + hours);
        return d0;
    }

    static addMinutes(date:Date, minutes:number):Date{
        let d0: Date = new Date(date);
        d0.setMinutes(date.getMinutes() + minutes);
        return d0;
    }

    static addMonth(date: Date, month: number): Date {
        let d0: Date = new Date(date);
        d0.setMonth(d0.getMonth() + month);
        return d0;
    }

    static getFirstDayOfMonth(date: Date): Date {
        let d0: Date = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
        return d0;
    }

    static getMonday(d: Date): Date {
        let d0: Date = new Date(d);
        var day: number = d0.getDay();
        var diff: number = d0.getDate() - day + (day == 0 ? -6 : 1);
        return new Date(d0.setDate(diff));
    }

    static getFixedDate(d: Date) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    }

  

    static isWithin(d: Date, left: Date, right: Date) {
        let a = DateUtil.getFixedDate(left);
        let b = DateUtil.getFixedDate(right);
        let i = DateUtil.getFixedDate(d);
        console.log('COMPARE: ' + a + "_" + b + "_" + i + "_" + d + "_" + (a.getTime() <= i.getTime() && b.getTime() >= i.getTime()));
        return a <= i && b >= i;
    }

    static getTimeString(date:Date, trim:boolean = false):string{
        let minutes = date.getMinutes();
        if (trim){
            minutes = minutes <30 ? 0 : 30;
        }
        return (date.getHours() < 10 ? '0': '') + date.getHours() + ':' + (minutes < 10 ? '0':'') + minutes;
    }

    static isGanztags(dauer:string):boolean {
        return dauer.indexOf("d")>=0;
    }

}