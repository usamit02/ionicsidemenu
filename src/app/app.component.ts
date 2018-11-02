import { Component, ViewChild, destroyPlatform } from '@angular/core';
import { Nav, Platform, ActionSheetController, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as firebase from 'firebase';
import * as $ from 'jquery'
import { HomePage } from '../pages/home/home';
import { VideoPage } from '../pages/video/video';
import { GridPage } from '../pages/grid/grid';
import { PayPage } from '../pages/pay/pay';
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
  allRooms = [];
  rooms = [];
  members = [];
  room = { id: "1", na: "メインラウンジ", parent: "0", folder: false };
  folder = { id: "0", na: "ブロガーズギルド", parent: "0", folder: true };
  user;
  userX: string;
  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private socket: Socket,
    public session: SessionProvider,
    public mysql: MysqlProvider,
    public actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController
  ) {
    this.platform.ready().then(() => { // Okay, so the platform is ready and our plugins are available.Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    firebase.initializeApp(firebaseConfig);
    this.socket.connect();
    this.user = false;
  }
  ngOnInit() {
    this.session.sessionState.subscribe((session: Session) => {
      if (session.rtc) {
        this.nav.setRoot(VideoPage, { room: this.room, rtc: session.rtc });
        this.socket.emit('rtc', session.rtc);
      } else if (session.room) {
        this.joinRoom(session.room);
        this.session.clearRoom();
      } else {
        if (session.user) {
          this.user = session.user;
          let u = { id: this.user.uid, name: this.user.displayName, avatorUrl: this.user.photoURL }
          this.socket.emit('join', { newRoomId: this.room.id, user: u, rtc: session.rtc });
          this.mysql.room(this.user ? this.user.uid : "0").subscribe((data: any) => {
            this.allRooms = data;
            this.rooms = data.filter(r => { if (r.parent === this.folder.id) return true; });
          });
        } else {
          this.user = false;
          this.socket.emit('logout', { roomId: this.room.id });
        }
      }
    })
    this.socket.on("join", users => { this.members = users; });

  }
  joinRoom(room) { // Reset the content nav to have just this page. we wouldn't want the back button to show in this scenario
    if (room.folder) {
      if (room.allow == "1") {
        this.rooms = this.allRooms.filter(r => { if (r.parent === room.id) return true; });
        this.folder = room;
        this.nav.setRoot(GridPage, { folder: room, rooms: this.rooms });
        leaveRoom(this);
      } else {
        payRoom();
      }
    } else {
      if (room.allow == "1") {
        this.nav.setRoot(HomePage, { room: room });
        leaveRoom(this);
      } else {
        payRoom();
      }
    }
    function leaveRoom(that) {
      that.socket.emit('leave', { oldRoomId: that.room.id });
      that.room = room;
    }
    function payRoom() {
      if (this.user) {
        let actionSheet = this.actionSheetCtrl.create({
          title: 'サロンに加入しますか',
          buttons: [
            {
              text: '月額課金手続き',
              icon: "money",
              role: 'destructive',
              handler: () => {
                this.nav.setRoot(PayPage, { user: this.user, room: room });
                leaveRoom(this);
              }
            },
            {
              text: '加入しない',
              icon: "close",
              role: 'cancel'
            }
          ]
        });
        actionSheet.present();
      } else {
        let toast = this.toastCtrl.create({
          message: "ログインしてください",
          duration: 3000,
          position: 'top'
        });
        toast.present();
      }
    }
  }
  letMember(member) {
    let toast = this.toastCtrl.create({
      message: member.name + "について表示する予定、ここからDM、ビデオ通話など",
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
  retRoom() {
    if (this.room.folder) {
      this.rooms = this.allRooms.filter(r => { if (r.parent === this.room.parent) return true; });
    } else {
      let parent = this.allRooms.filter(r => { if (r.id === this.room.parent) return true; });
      this.rooms = this.allRooms.filter(r => { if (r.parent === parent[0].parent) return true; });
    }
    let folder = this.allRooms.filter(r => { if (r.id === this.rooms[0].parent) return true; });
    this.folder = folder[0];
  }
  searchMember() {
    let toast = this.toastCtrl.create({
      message: this.userX + "は席を外しているようです。",
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
    alert()
  }
}
