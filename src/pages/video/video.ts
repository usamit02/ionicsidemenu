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
  video: boolean;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private session: SessionProvider,
    public afAuth: AngularFireAuth,
    public actionSheetCtrl: ActionSheetController
  ) {
    this.mediaRoom = this.navParams.data.room;
    this.user = this.navParams.data.user;
    this.video = this.navParams.data.video;
  }
  ngOnInit() {
    this.session.sessionState.subscribe((session: Session) => {
      if (session.rtcStop) {
        // if (this.peerRoom) {
        //   this.peerRoom.close();
        // }
        this.session.clearRtcStop();
      } else if (session.chat) {
        this.chats.push(session.chat);
        setTimeout(() => {
          this.content.scrollToBottom();
        }, 400);
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
    const rtc: string = this.navParams.data.rtc;
    let myVideoPeerId: string;
    let yourVideoPeerId: string;
    let audioPeerId: string;
    let media = { video: { width: { min: 240, max: 320 }, height: { min: 180, max: 240 } }, audio: true };
    navigator.mediaDevices.getUserMedia(media).then(stream => {
      if (rtc === "videocam") {
        let myVideo = <HTMLVideoElement>document.getElementById('myVideo');
        myVideo.srcObject = stream;
        this.localStream = stream;
        myVideo.onloadedmetadata = (e) => {
          setTimeout(() => {
            myVideo.muted = true;
            this.content.resize();
          }, 1000);
        };
      } else {
        let tempVideoTrack = stream.getVideoTracks()[0];
        let tempAudioTrack = stream.getAudioTracks()[0];
        tempVideoTrack.enabled = false;
        tempAudioTrack.enabled = rtc === "mic" ? true : false;
        let mutedStream = new MediaStream();
        mutedStream.addTrack(tempVideoTrack);
        mutedStream.addTrack(tempAudioTrack);
        this.localStream = mutedStream;
      }
    }).catch(err => {
      alert(err);
      return;
    });
    this.peer = new Peer(rtc + "_" + this.user.uid, {
      key: '11d26de3-711f-4a5f-aa60-30142aeb70d9',
      debug: 3
    });
    this.peer.on('open', () => {
      this.peerRoom = this.peer.joinRoom(this.mediaRoom.id, { stream: this.localStream });
      this.peerRoom.on('stream', stream => {
        let pid = stream.peerId.split("_");
        if (pid[1] !== this.user.uid) {
          if (pid[0] === "mic") {
            let audio = <HTMLAudioElement>document.getElementById('audio');
            audio.srcObject = stream;
            audioPeerId = stream.peerId;
            audio.play();
          } else if (pid[0] === "videocam") {
            let myVideo = <HTMLVideoElement>document.getElementById('myVideo');
            if (!myVideo.srcObject) {
              myVideo.srcObject = stream;
              myVideoPeerId = stream.peerId;
              myVideo.onloadedmetadata = (e) => {
                setTimeout(() => {
                  myVideo.play();
                  this.content.resize();
                }, 1000);
              };
            } else {
              let yourVideo = <HTMLVideoElement>document.getElementById('yourVideo');
              if (!yourVideo.srcObject) {
                yourVideo.srcObject = stream;
                yourVideoPeerId = stream.peerId;
                yourVideo.onloadedmetadata = (e) => {
                  setTimeout(() => {
                    yourVideo.play();
                    this.content.resize();
                  }, 1000);
                };
              }
            }
          }
        }
      });
      this.peerRoom.on('peerLeave', peerId => {
        let myVideo = <HTMLVideoElement>document.getElementById('myVideo');
        if (myVideo.srcObject && myVideoPeerId == peerId) {
          myVideo.srcObject = undefined; myVideoPeerId = "";
        }
        let yourVideo = <HTMLVideoElement>document.getElementById('yourVideo');
        if (yourVideo.srcObject && yourVideoPeerId == peerId) {
          yourVideo.srcObject = undefined; yourVideoPeerId = "";
        }
        let audio = <HTMLAudioElement>document.getElementById('audio');
        if (audio.srcObject && audioPeerId == peerId) {
          audio.srcObject = undefined; audioPeerId = "";
        }
      });
      this.peerRoom.on('removeStream', stream => {
      });
      this.peerRoom.on('close', () => {
        let myVideo = <HTMLVideoElement>document.getElementById('myVideo');
        myVideo.srcObject = undefined; myVideoPeerId = "";
        let yourVideo = <HTMLVideoElement>document.getElementById('yourVideo');
        yourVideo.srcObject = undefined; yourVideoPeerId = "";
        let audio = <HTMLAudioElement>document.getElementById('audio');
        audio.srcObject = undefined; audioPeerId = "";
        this.localStream = undefined;
        this.peer.disconnect();
      });
    });
    this.peer.on('error', err => {
      alert(err.type + ':' + err.message);
    });
    this.peer.on('close', () => {
    });
    this.peer.on('disconnected', () => {
      this.session.joinRoom(this.mediaRoom);
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
  stop() {
    if (this.peerRoom) {
      this.peerRoom.close();
    }

  }
}