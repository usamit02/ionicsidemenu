import { Component, ViewChild, destroyPlatform } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as firebase from 'firebase';
import * as $ from 'jquery'
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
  allRooms = {};
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
    this.user = false;
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
    this.socket.on("join", users => { this.members = users; });
    this.mysql.room(this.user ? this.user.uid : "0").subscribe((data: any) => {
      var html: string = "";
      var menudeep: number = 0;
      function addRoom(parent) {
        let childRooms = data.filter(r => { if (r.parent === parent) return true; });
        if (childRooms.length) {
          html += '<ul class = "f' + (menudeep + 1) + '">';
          menudeep++;
          for (let r of childRooms) {
            html += '<li class="f' + (menudeep + 1) + '"><button ion-button (click)="joinRoom(' + r.id + ')">' + r.na + '</button>';
            if (addRoom(r.id)) { html += '<span class="ex">▼</span>' };
            html += '</li>'
          }
          html += '</ul>';
          menudeep++;
        } else {
          return false;
        }
        return true;
      }
      addRoom("0");
      console.log(html);
      html = '<button ion-button (click)="alert(' + "'?'" + ')">ボタン</button>';
      $("#nav").html(html);
      this.rooms = data;
    });
  }
  joinRoom(room) { // Reset the content nav to have just this page. we wouldn't want the back button to show in this scenario
    if (room.price === null) {
      alert("?");
      /*
      if ('expand' in room && room.expand) {
        let childRooms = this.rooms.filter(r => { if (r.parent === room.id) return true; });
        for (let i = 0; i < this.rooms.length; i++) {
          if (this.rooms[i].id === room.id) {
            Array.prototype.splice.apply(this.rooms, [i + 1, 0].concat(childRooms));
            break;
          }
        }
      } else {
         let childRooms = this.allRooms.filter(r => { if (r.parent === room.id) return true; });
         for (let i = 0; i < this.rooms.length; i++) {
           if (this.rooms[i].id === room.id) {
             Array.prototype.splice.apply(this.rooms, [i + 1, 0].concat(childRooms));
             break;
           }
         }
      }
      */
    } else {
      this.nav.setRoot(HomePage, { room: room });
    }
    this.socket.emit('leave', { oldRoomId: this.room.id });
    this.room = room;
  }
  letMember(member) {
    alert(member.displayName + "について表示する予定、ここからDM、ビデオ通話など");
  }
  liClick(that) {
    $(that).next('ul').slideToggle('fast'); // メニュー表示/非表示
  }
  spanClick(that) {
    $(that).children('ul').slideToggle('fast'); // メニュー表示/非表示
    var ex = $(that).children('span').text();
    if (ex == "▼") {
      ex = ex.replace("▼", "▲");
      $(that).css({ "flex": "10" });
    } else {
      ex = ex.replace("▲", "▼");
      $(that).css({ "flex": "1 1 50px" });
    }
    $(that).children('span').text(ex);
    //e.stopPropagation();
  }
  ionViewDidLoad() {
    $('span').on('click', function () {// 親メニュー処理   
      $(this).next('ul').slideToggle('fast'); // メニュー表示/非表示
    });
    $('li').on('click', function (e) {// 子メニュー処理     
      $(this).children('ul').slideToggle('fast'); // メニュー表示/非表示
      var ex = $(this).children('span').text();
      if (ex == "▼") {
        ex = ex.replace("▼", "▲");
        $(this).css({ "flex": "10" });
      } else {
        ex = ex.replace("▲", "▼");
        $(this).css({ "flex": "1 1 50px" });
      }
      $(this).children('span').text(ex);
      e.stopPropagation();
    });
  }
}
