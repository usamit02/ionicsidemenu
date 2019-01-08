import { Component, ViewChild, destroyPlatform } from '@angular/core';
import { Nav, Platform, ActionSheetController, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as firebase from 'firebase';
import { HomePage } from '../pages/home/home';
import { VideoPage } from '../pages/video/video';
import { GridPage } from '../pages/grid/grid';
import { firebaseConfig } from '../environment';
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
  room = { id: 2, na: "メインラウンジ", allow: 1, parent: 1, folder: 0, bookmark: 0 };
  folder = { id: 1, na: "ブロガーズギルド", parent: 1, folder: 0 };
  user;
  userX: string;
  bookmk: boolean = false;
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
    this.socket.on("join", users => {
      console.log(users[0].name + "_" + users[0].rtc);
      this.members = users;
    });
    this.socket.on("typing", name => {
      this.session.typing(name);
      this.session.clearTyping();
    });
    this.socket.on("chat", chat => {
      this.session.chat(chat);
      this.session.clearChat();
    });
    this.readRooms();
    this.session.sessionState.subscribe((session: Session) => {
      if (session.room) {
        this.joinRoom(session.room);
        this.session.clearRoom();
      } else if (session.rtc) {
        this.nav.setRoot(VideoPage, { room: this.room, rtc: session.rtc, video: session.video, user: session.user });
        this.socket.emit('rtc', session.rtc);
        this.session.clearRtc();
      } else if (session.keyPress) {
        this.socket.emit('typing', this.user.displayName);
        this.session.clearKey();
      } else if (session.msg) {
        this.socket.emit('chat', session.msg);
        this.session.clearMsg();
      } else {
        if (session.user != this.user) {
          if (session.user) {
            this.user = session.user;
            let user = { id: this.user.uid, name: this.user.displayName, avatorUrl: this.user.photoURL }
            this.socket.emit('join', { newRoomId: this.room.id, user: user, rtc: session.rtc });
          } else {
            this.user = false;
            this.bookmk = false;
            this.socket.emit('logout', { roomId: this.room.id });
          }
          this.readRooms();
        }
      }
    });
  }
  readRooms() {
    let uid = this.user ? this.user.uid : "0";
    this.mysql.query("room.php", { uid: uid }).subscribe((data: any) => {
      this.allRooms = data;
      if (this.bookmk) {
        this.rooms = data.filter(r => { if (r.bookmark === 1) return true; });
      } else {
        this.rooms = data.filter(r => { if (r.parent === this.folder.id) return true; });
      }
    });
  }
  joinRoom(room) {
    //if (this.session.getRtc()) { this.session.rtcStop(); }
    if (room.allow === 1) {
      if (room.folder) {
        this.rooms = this.allRooms.filter(r => { if (r.parent === room.id) return true; });
        this.folder = room;
        this.nav.setRoot(GridPage, { folder: room, rooms: this.rooms });
      } else {
        this.nav.setRoot(HomePage, { room: room });
      }
    } else {
      this.nav.setRoot(HomePage, { room: room, user: this.user });
    }
    let user = { id: this.user.uid, name: this.user.displayName, avatorUrl: this.user.photoURL }
    this.socket.emit('join', { newRoomId: room.id, oldRoomId: this.room.id, user: user, rtc: "" });
    this.room = room;
  }
  retRoom() {
    //if (this.session.getRtc()) { this.session.rtcStop(); }
    if (this.folder.id === 0) {
      if (this.user) {
        this.bookmk = !this.bookmk;
        this.readRooms();
      }
    } else {
      let folder = this.allRooms.filter(r => { if (r.id === this.folder.parent) return true; });
      if (folder.length) {
        this.folder = folder[0];
        if (!this.bookmk) {
          this.rooms = this.allRooms.filter(r => { if (r.parent === this.folder.id) return true; });
        }
      }
    }
  }
  letMember(member) {
    let toast = this.toastCtrl.create({
      message: member.name + "について自己紹介やtwitterリンクを表示する予定、ここからDM、ビデオ通話など",
      duration: 3000,
      position: 'top'
    });
    toast.present();
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
  bookmark(room) {
    if (this.user) {
      this.mysql.addBookmark(this.user.uid, room.id, room.bookmark).subscribe((data: any) => {
        let msg;
        if (data.msg === "ok") {
          //this.room.bookmark = this.room.bookmark === "1" ? "0" : "1";
          msg = room.bookmark === "1" ? "のブックマークを外しました。" : "をブックマークしました。";
          msg = "「" + room.na + "」" + msg;
          this.readRooms();
        } else {
          msg = data.msg;
        }
        let toast = this.toastCtrl.create({
          message: msg, duration: 3000
        });
        toast.present();
      });
    } else {
      let toast = this.toastCtrl.create({ message: "ログインしてください。", duration: 3000 });
      toast.present();
    }
  }
}
