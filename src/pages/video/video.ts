import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content, ActionSheetController } from 'ionic-angular';
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { Session, SessionProvider } from '../../providers/session/session';
@IonicPage()
@Component({
  selector: 'page-video',
  templateUrl: 'video.html',
})
export class VideoPage {
  @ViewChild(Content) content: Content;
  peer;
  peerRoom;
  mediaRoom;
  localStream: MediaStream;
  user;
  message: string;
  chats = [];
  typing: boolean = true;
  writer: string = "";
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private session: SessionProvider,
    public afAuth: AngularFireAuth,
    public actionSheetCtrl: ActionSheetController
  ) {
    this.mediaRoom = this.navParams.data.room;
    this.user = this.navParams.data.user;
  }
  ngOnInit() {
    this.session.sessionState.subscribe((session: Session) => {
      if (session.rtcStop) {
        if (this.peerRoom) {
          this.peerRoom.close();
          //this.navCtrl.setRoot(HomePage, { room: this.mediaRoom });
        }
        this.session.clearRtcStop();
      } else if (session.chat) {
        this.chats.push(session.chat);
        setTimeout(() => {
          if (this.content.scrollToBottom) {
            this.content.scrollToBottom();
          }
        }, 400)
      } else if (session.typing) {
        this.writer = session.typing + "が入力中";
        setTimeout(() => {
          this.writer = "";
        }, 3000);
      }
    });
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
    if (this.navParams.data.rtc !== 'headset') {
      let media = this.navParams.data.rtc == 'mic' ?
        { video: { width: { min: 320, max: 480 }, height: { min: 240, max: 320 } }, audio: true } :
        { audio: true, video: false };
      navigator.mediaDevices.getUserMedia(media).then(stream => {
        let video = <HTMLVideoElement>document.getElementById('myVideo');
        video.srcObject = stream;
        this.localStream = stream;
        video.onloadedmetadata = (e) => {
          setTimeout(() => {
            this.content.resize();
          }, 1000);
        };
      }).catch(err => {
        alert(err);
        return;
      });
    }
    this.peer = new Peer({
      key: '11d26de3-711f-4a5f-aa60-30142aeb70d9',
      debug: 3
    });
    this.peer.on('open', () => {
      //     let mode = this.navParams.data.rtc === 'headset' ? { mode: 'mesh' } : { mode: 'sfu', stream: this.localStream };
      let mode = this.navParams.data.rtc === 'headset' ? {} : { stream: this.localStream };
      this.peerRoom = this.peer.joinRoom(this.mediaRoom.id, mode);
      this.peerRoom.on('stream', stream => {
        let myVideo = <HTMLVideoElement>document.getElementById('myVideo');
        if (!myVideo.srcObject) {
          //$("#myVideo").css({ "width": "320px", "height": "240px" });
          myVideo.srcObject = stream;
          myVideo.play();
          myVideo.onloadedmetadata = (e) => {
            setTimeout(() => {
              this.content.resize();
            }, 1000);
          };
        } else {
          let yourVideo = <HTMLVideoElement>document.getElementById('yourVideo');
          if (!yourVideo.srcObject) {
            //$("#yourVideo").css({ "width": "320px", "height": "240px" });
            yourVideo.srcObject = stream;
            yourVideo.play();
            yourVideo.onloadedmetadata = (e) => {
              setTimeout(() => {
                this.content.resize();
              }, 1000);
            };
          }
        }
      });
      this.peerRoom.on('peerLeave', peerid => {
      });
      this.peerRoom.on('removeStream', stream => {
      });
      this.peerRoom.on('close', () => {
        let myVideo = <HTMLVideoElement>document.getElementById('myVideo');
        myVideo.srcObject = undefined;
        let yourVideo = <HTMLVideoElement>document.getElementById('yourVideo');
        yourVideo.srcObject = undefined;
        //$("video").css({ "width": "0px", "height": "0px" });
        this.peer.disconnect();
      });
    });
    this.peer.on('error', err => {
      alert(err.type + ':' + err.message);
    });
    this.peer.on('close', () => {
    });
    this.peer.on('disconnected', () => {
    });
  }
  keyPress() {
    if (this.typing) {
      this.session.keyPress();
      this.typing = false;
    }
    setTimeout(() => {
      this.typing = true;
    }, 2000);
  }
  sendMsg() {
    if (this.user) {
      if (!this.message.trim()) return;
      let msg = {
        user: this.user.displayName,
        message: this.message,
        avatar: this.user.photoURL
      };
      this.session.sendMsg(msg);
      this.message = "";
    }
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
}