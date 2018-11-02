import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable()
export class SessionProvider {
  public session = new Session();
  public sessionSubject = new Subject<Session>();
  public sessionState = this.sessionSubject.asObservable();
  constructor() {
  }
  login(user) {
    this.session.login = true;
    this.session.user = user;
    this.session.rtc = false;
    this.sessionSubject.next(this.session);
  }
  logout(): void {
    this.sessionSubject.next(this.session.reset());
  }
  getUser() {
    return this.session.user;
  }
  rtc(action) {
    this.session.rtc = action;
    this.sessionSubject.next(this.session);
  }
  joinRoom(room) {
    this.session.room = room;
    this.session.rtc = false;
    this.sessionSubject.next(this.session);
  }
  clearRoom(): void {
    this.session.room = false;
  }
}
export class Session {
  login: boolean;
  user;
  rtc;
  room;
  constructor() {
    this.login = false;
    this.room = false;
  }
  reset(): Session {
    this.login = false;
    this.user = false;
    this.rtc = false;
    this.room = false;
    return this;
  }
}
