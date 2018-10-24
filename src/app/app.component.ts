import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as firebase from 'firebase';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { firebaseConfig } from './app.module';
import { NgOnChangesFeature } from '@angular/core/src/render3';
import { Socket } from 'ng-socket-io';
import { Session, SessionProvider } from '../providers/session/session';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = HomePage;
  rooms = [];
  members = [];
  room: string = "1";
  user;
  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private socket: Socket,
    public session: SessionProvider
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
      if (session.user) {
        this.user = session.user;
        this.socket.emit('join', { newRoomId: this.room, user: this.user });
      } else {
        this.user = false;
        this.socket.emit('logout', { roomId: this.room });
      }
    })
    firebase.database().ref('room').on('value', resp => {
      if (resp) {
        this.rooms = [];
        resp.forEach(childSnapshot => {
          const room = childSnapshot.val();
          room.key = childSnapshot.key;
          this.rooms.push(room);
        });
      }
    });
    this.socket.on("join", users => {
      this.members = [];
      for (let i = 0; i < users.length; i++) {
        this.members.push(users[i].name);
      }
    });
  }
  joinRoom(room) { // Reset the content nav to have just this page. we wouldn't want the back button to show in this scenario
    this.nav.setRoot(HomePage, { room: room });
    this.socket.emit('leave', { oldRoomId: this.room });
    this.room = room.key;
  }
  letMember(member) {
    alert(member.displayName + "について表示する予定、ここからDM、ビデオ通話など");
  }
}
