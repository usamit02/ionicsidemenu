import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { SessionProvider } from '../../providers/session/session';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild(Content) content: Content;
  room;
  user: any = false;
  message: string;
  chats = [];
  users = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public afAuth: AngularFireAuth, private session: SessionProvider) {
    this.room = 'room' in this.navParams.data ? this.navParams.data.room : { id: "1", na: "メインラウンジ" };
  }
  ngOnInit() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.user = user;
        this.session.login(this.user);
      } else {
        this.user = false;
        this.session.logout();
      }
    });
    if (this.room) {
      firebase.database().ref('chat/' + this.room.id).on('value', resp => {
        if (resp) {
          this.chats = [];
          resp.forEach(childSnapshot => {
            const chat = childSnapshot.val();
            chat.key = childSnapshot.key;
            this.chats.push(chat);
          });
        }
      });
    }
  }
  sendMsg() {
    if (!this.message.trim()) return;
    const newData = firebase.database().ref('chat/' + this.room.id).push();
    newData.set({
      user: this.user.displayName,
      message: this.message,
      sendDate: Date()
    });
    this.message = "";
    setTimeout(() => {
      if (this.content.scrollToBottom) {
        this.content.scrollToBottom();
      }
    }, 400)
  }
  loginTwitter() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider());
  }
  loginFacebook() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
  }
  loginGoogle() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
  logout() {
    this.afAuth.auth.signOut();
  }
  rtc(action) {
    this.session.rtc(action);
  }
}
