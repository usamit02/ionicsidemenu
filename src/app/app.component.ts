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
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = HomePage;
  rooms = [];
  members = [];
  room: Number = 1;
  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private socket: Socket) {
    this.platform.ready().then(() => { // Okay, so the platform is ready and our plugins are available.Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    firebase.initializeApp(firebaseConfig);
  }
  ngOnInit() {
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
    firebase.database().ref('member/' + this.room).on('value', resp => {
      if (resp) {
        this.members = [];
        resp.forEach(childSnapshot => {
          const member = childSnapshot.val();
          member.key = childSnapshot.key;
          this.members.push(member);
        });
      }
    });


  }
  joinRoom(room) { // Reset the content nav to have just this page. we wouldn't want the back button to show in this scenario
    this.nav.setRoot(HomePage, { room: room });
  }
  letMember(member) {
    alert(member.displayName + "について表示する予定、ここからDM、ビデオ通話など");
  }
}
