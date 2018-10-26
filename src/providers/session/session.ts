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
  rtc(action) {
    this.session.rtc = action;
    this.sessionSubject.next(this.session);
  }
}
export class Session {
  login: boolean;
  user;
  rtc;
  constructor() {
    this.login = false;
  }
  reset(): Session {
    this.login = false;
    this.user = false;
    this.rtc = false;
    return this;
  }
}
