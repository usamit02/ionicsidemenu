import { Component, Input } from '@angular/core';
import { IonicPage, NavController, ActionSheetController } from 'ionic-angular';
import { MysqlProvider } from '../../providers/mysql/mysql';
import { PayPage } from '../../pages/pay/pay';
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { SessionProvider } from '../../providers/session/session';
declare var twttr;
@IonicPage()
@Component({
  selector: 'story',
  templateUrl: 'story.html',
})
export class StoryPage {
  storys = [];
  story: string;
  @Input() room;
  @Input() user;
  constructor(public navCtrl: NavController,
    public mysql: MysqlProvider,
    public actionSheetCtrl: ActionSheetController,
    private session: SessionProvider,
    public afAuth: AngularFireAuth
  ) {
  }
  ngOnInit() {
    this.mysql.query("story.php", { uid: this.user.uid, rid: this.room.id }).subscribe((res: any) => {
      this.storys = res.main;
      setTimeout(() => {
        twttr.widgets.load();
      });
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
