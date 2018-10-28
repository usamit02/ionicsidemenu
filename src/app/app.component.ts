import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as firebase from 'firebase';
import { HomePage } from '../pages/home/home';
import { VideoPage } from '../pages/video/video';
import { firebaseConfig } from './app.module';
import { NgOnChangesFeature } from '@angular/core/src/render3';
import { Socket } from 'ng-socket-io';
import { Session, SessionProvider } from '../providers/session/session';
import { MysqlProvider } from '../providers/mysql/mysql';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = HomePage;
  rooms = [];
  members = [];
  room = { id: "1", name: "メインラウンジ" };
  user;
  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private socket: Socket,
    public session: SessionProvider,
    public mysql: MysqlProvider
  ) {
    this.platform.ready().then(() => { // Okay, so the platform is ready and our plugins are available.Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    firebase.initializeApp(firebaseConfig);
    this.socket.connect();
  }
  ngOnInit() {
    this.session.sessionState.subscribe((session: Session) => {
      if (session.rtc) {
        this.nav.setRoot(VideoPage, { room: this.room, rtc: session.rtc });
        this.socket.emit('rtc', session.rtc);
      } else {
        if (session.user) {
          this.user = session.user;
          let u = { id: this.user.uid, name: this.user.displayName, avatorUrl: this.user.photoURL }
          this.socket.emit('join', { newRoomId: this.room.id, user: u, rtc: session.rtc });
        } else {
          this.user = false;
          this.socket.emit('logout', { roomId: this.room.id });
        }
      }
    })
    this.mysql.room(0).subscribe((data: any) => {
      this.rooms = data;
    });
    this.socket.on("join", users => {
      this.members = [];
      for (let i = 0; i < users.length; i++) {
        this.members.push(users[i]);
      }
    });
  }
  joinRoom(room) { // Reset the content nav to have just this page. we wouldn't want the back button to show in this scenario
    this.nav.setRoot(HomePage, { room: room });
    this.socket.emit('leave', { oldRoomId: this.room.id });
    this.room = room;
  }
  letMember(member) {
    alert(member.displayName + "について表示する予定、ここからDM、ビデオ通話など");
  }
}
