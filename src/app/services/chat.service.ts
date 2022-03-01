import { Injectable } from "@angular/core";
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';

var counter = -1;
@Injectable()
export class ChatService {

  public socket = io(environment.socketUrl);//, { transports: ['polling'] }

  join(data) {
    this.socket.emit("join", data);
  }

  newUserJoined() {
    let observable = new Observable<{ "commentBy": String, "data_created": Number, "tag": String, "commentTo": String, "comment": String }>(observer => {
      this.socket.on('new user joined', (data) => {
        observer.next(data);
      });
      return () => { this.socket.disconnect(); }
    });
    return observable;
  }

  leave(data) {
    this.socket.emit("left", data);
  }

  userLeft() {
    let observable = new Observable<{ "commentBy": String, "data_created": Number, "tag": String, "commentTo": String, "comment": String }>(observer => {
      this.socket.on('left room', (data) => {
        observer.next(data);
      });
      return () => { this.socket.disconnect(); }
    });
    return observable;
  }

  sendMessage(data) {
    this.socket.emit("message", data);
  }

  newMessageReceived() {
    let observable = new Observable<{ "commentBy": String, "data_created": Number, "tag": String, "commentTo": String, "comment": String }>(observer => {
      this.socket.on('new message', (data) => {
        observer.next(data);
      });
      return () => { this.socket.disconnect(); }
    });
    return observable;
  }

  // receive notifications
  newNotification(id) {
    // console.log("id $$$$$$$$$$$$$$$$$$$444 >>>>>>>>", id);
    let observable = new Observable<{ object: object }>(observer => {
      // console.log("id observable444 >>>>>>>>", id);
      this.socket.on(id, (data) => {
        // console.log("id socket.on 444 >>>>>>>>", id);
        observer.next(data);
      });
      // return () => {
      //   this.socket.disconnect();
      // }
    });
    return observable;
  }

  refreshContent(id) {
    // console.log("id $$$$$$$$$$$$$$$$$$$444 >>>>>>>>", id);
    let observable = new Observable<{ object: object }>(observer => {
      this.socket.on(id, (data) => {
        counter++;
        // console.log("Counter >>>", counter)
        if (counter == 0) {
          observer.next(data);
          counter = -1;
        } else {
          observer.next(null);
        }
      });
      return () => {
        // console.log("check for socket disconnect");
        this.socket.disconnect();
      }
    });
    return observable;
  }

  logoutSoket() {
    let observable = new Observable<{ object: object }>(observer => {
      return () => {
        this.socket.disconnect();
      }
    });
    return observable;
  }
}
