import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { MysqlProvider } from '../../providers/mysql/mysql';
import { PayPage } from '../../pages/pay/pay';
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { SessionProvider } from '../../providers/session/session';
@IonicPage()
@Component({
  selector: 'page-story',
  templateUrl: 'story.html',
})
export class StoryPage {
  storys = [];
  story: string;
  room;
  user;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public mysql: MysqlProvider,
    public actionSheetCtrl: ActionSheetController,
    private session: SessionProvider,
    public afAuth: AngularFireAuth
  ) {
    this.room = this.navParams.data.room;
    this.user = this.navParams.data.user;
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
  }

  ionViewDidLoad() {
    this.mysql.story(this.room.id).subscribe((data: any) => {
      document.getElementById("main").innerHTML = data;
    });
  }
  pay() {
    if (this.user) {
      this.navCtrl.setRoot(PayPage, { user: this.user, room: this.room });
    } else {
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
  }
  logout() {
    this.afAuth.auth.signOut();
  }
}
