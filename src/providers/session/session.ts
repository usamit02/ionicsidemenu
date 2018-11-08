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
    this.session.rtcPlay = action;
  }
  clearRtc(): void {
    this.session.rtc = false;
  }
  getRtc() {
    return this.session.rtcPlay;
  }
  rtcStop(): void {
    this.session.rtcStop = true;
    this.sessionSubject.next(this.session);
    this.session.rtcPlay = false;
  }
  clearRtcStop(): void {
    this.session.rtcStop = false;
  }
  getVideo(): boolean {
    return this.session.video;
  }
  setVideo(): boolean {
    this.session.video = !this.session.video;
    return this.session.video;
  }
  joinRoom(room) {
    this.session.room = room;
    this.session.rtc = false;
    this.sessionSubject.next(this.session);
  }
  clearRoom(): void {
    this.session.room = false;
  }
  keyPress(): void {
    this.session.keyPress = true;
    this.sessionSubject.next(this.session);
  }
  clearKey(): void {
    this.session.keyPress = false;
  }
  typing(name): void {
    this.session.typing = name;
    this.sessionSubject.next(this.session);
  }
  clearTyping(): void {
    this.session.typing = "";
  }
  sendMsg(msg): void {
    this.session.msg = msg;
    this.sessionSubject.next(this.session);
  }
  clearMsg(): void {
    this.session.msg = false;
  }
  chat(chat): void {
    this.session.chat = chat;
    this.sessionSubject.next(this.session);
  }
  clearChat(): void {
    this.session.chat = false;
  }
}
export class Session {
  login: boolean;
  typing: string;
  keyPress: boolean;
  user;
  rtc;
  rtcPlay;
  rtcStop;
  video;
  room;
  msg;
  chat;
  constructor() {
    this.login = false;
    this.room = false;
    this.rtc = false;
    this.rtcPlay = false;
    this.rtcStop = false;
    this.video = true;
    this.typing = "";
    this.keyPress = false;
    this.chat = false;
    this.msg = false;
  }
  reset(): Session {
    this.login = false;
    this.user = false;
    this.rtc = false;
    this.rtcStop = false;
    this.room = false;
    this.typing = "";
    this.keyPress = false;
    this.msg = false;
    this.chat = false;
    return this;
  }
}
