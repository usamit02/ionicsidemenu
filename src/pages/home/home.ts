import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content, ActionSheetController } from 'ionic-angular';
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
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    private session: SessionProvider,
    public actionSheetCtrl: ActionSheetController
  ) {
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
  typing() {

  }
  sendMsg() {
    if (!this.message.trim()) return;
    const newData = firebase.database().ref('chat/' + this.room.id).push();
    newData.set({
      user: this.user.displayName,
      message: this.message,
      sendDate: Date(),
      avatar: this.user.photoURL
    });
    this.message = "";
    setTimeout(() => {
      if (this.content.scrollToBottom) {
        this.content.scrollToBottom();
      }
    }, 400)
  }
  login() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'ログイン',
      buttons: [
        {
          text: 'twitter',
          icon: "logo-twitter",
          role: 'destructive',
          handler: () => {
            this.afAuth.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider());
          }
        }, {
          text: 'facebook',
          icon: "logo-facebook",
          role: 'destructive',
          handler: () => {
            this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
          }
        }, {
          text: 'google',
          icon: "logo-google",
          role: 'destructive',
          handler: () => {
            this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
          }
        },
        {
          icon: "close",
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }
  logout() {
    this.afAuth.auth.signOut();
  }
  rtc(action) {
    this.session.rtc(action);
  }
}
