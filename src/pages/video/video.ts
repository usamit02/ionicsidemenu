import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PercentPipe } from '@angular/common';
import { HomePage } from '../home/home';
@IonicPage()
@Component({
  selector: 'page-video',
  templateUrl: 'video.html',
})
export class VideoPage {
  peer;
  peerRoom;
  mediaRoom;
  localStream: MediaStream;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.mediaRoom = this.navParams.data.room;
  }
  ngOnInit() {
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
      let mode = this.navParams.data.rtc === 'headset' ? { mode: 'sfu' } : { mode: 'sfu', stream: this.localStream };
      this.peerRoom = this.peer.joinRoom(this.mediaRoom.id, mode);
      this.peerRoom.on('stream', stream => {
        let myVideo = <HTMLVideoElement>document.getElementById('myVideo');
        if (!myVideo.srcObject) {
          //$("#myVideo").css({ "width": "320px", "height": "240px" });
          myVideo.srcObject = stream;
          myVideo.play();
        } else {
          let yourVideo = <HTMLVideoElement>document.getElementById('yourVideo');
          if (!yourVideo.srcObject) {
            //$("#yourVideo").css({ "width": "320px", "height": "240px" });
            yourVideo.srcObject = stream;
            yourVideo.play();
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
  stop() {
    if (this.peerRoom) {
      this.peerRoom.close();
      this.navCtrl.setRoot(HomePage, { room: this.mediaRoom });
    }
  }
}
