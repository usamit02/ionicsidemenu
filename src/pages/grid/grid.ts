import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SessionProvider } from '../../providers/session/session';
import { MysqlProvider } from '../../providers/mysql/mysql';
@IonicPage()
@Component({
  selector: 'page-grid',
  templateUrl: 'grid.html',
})
export class GridPage {
  folder;
  rooms;
  constructor(public navCtrl: NavController, public navParams: NavParams, private session: SessionProvider, public mysql: MysqlProvider, ) {
    this.folder = this.navParams.data.folder;
    this.rooms = this.navParams.data.rooms;
  }

  joinRoom(room) {
    this.session.joinRoom(room);
  }
}
