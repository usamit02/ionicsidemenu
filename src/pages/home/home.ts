import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import * as firebase from 'firebase';
//import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import { SessionProvider } from '../../providers/session/session';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  room;
  user: any = false;
  //auth: Observable<firebase.User>;
  message: string;
  chats = [];
  users = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public afAuth: AngularFireAuth, private session: SessionProvider) {
    this.room = 'room' in this.navParams.data ? this.navParams.data.room : { key: "1", name: "メインラウンジ" };
  }
  ngOnInit() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.user = user;
        this.session.login(this.user);
        console.log("home.ts login");
      } else {
        this.user = false;
        this.session.logout();
      }
    });
    if (this.room) {
      firebase.database().ref('chat/' + this.room.key).on('value', resp => {
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
  ionViewWillUnload() {
    if (this.user) {
      const ref = firebase.database().ref('member/' + this.room.key + '/' + this.user.uid);
      ref.remove();
    }
  }
  sendMessage() {
    const newData = firebase.database().ref('chat/' + this.room.key).push();
    newData.set({
      user: this.user.displayName,
      message: this.message,
      sendDate: Date()
    });
  }
  loginTwitter() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider());
  }
  loginFacebook() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
  }
  logout() {
    this.afAuth.auth.signOut();
  }
}
