import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../../pages/home/home';
import { MysqlProvider } from '../../providers/mysql/mysql';
import { SessionProvider } from '../../providers/session/session';
@IonicPage()
@Component({
  selector: 'page-pay',
  templateUrl: 'pay.html',
})
export class PayPage {
  room;
  payjp;
  years = ["2018", "2019", "2020", "2021", "2022", "2023"];
  months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  card = { number: "4242424242424242", cvc: "123", exp_year: "2020", exp_month: "12" };
  constructor(public navCtrl: NavController, public navParams: NavParams, public mysql: MysqlProvider, private session: SessionProvider) {
    this.room = this.navParams.data.room;
  }

  ionViewDidLoad() {
    Payjp.setPublicKey("pk_test_a77ab4464e1cecb66c3d1b21");
  }
  pay(card) {
    Payjp.createToken(card, (s, response) => {
      if (response.error) {
        console.log(response.error.message);
      } else {
        let user = this.session.getUser();
        this.mysql.pay(response.id, this.room.price, this.room.id, user).subscribe((data: any) => {
          console.log(data);
          if (data.msg == "ok") {
            //this.navCtrl.setRoot(HomePage, { room: this.room });
            this.session.login(user);
            this.session.joinRoom(this.room);
          }
        });
      }
    });
  }
}
