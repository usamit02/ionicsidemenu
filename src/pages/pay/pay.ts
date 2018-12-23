import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { HomePage } from '../../pages/home/home';
import { MysqlProvider } from '../../providers/mysql/mysql';
import { Session, SessionProvider } from '../../providers/session/session';
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
  date;
  price;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private mysql: MysqlProvider,
    private session: SessionProvider,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController) {
    this.room = this.navParams.data.room;
  }
  ngOnInit() {
    Payjp.setPublicKey("pk_test_12e1f56f9f92414d7b00af63");
    const toDay = new Date;
    this.date = toDay.getDate();
    this.mysql.query("room.php", { plan: this.room.plan }).subscribe((data: any) => {
      if (!data.error) {
        this.price = data[0].amount;
      }
    });
  }

  pay(card) {
    var loader = this.loadingCtrl.create({
      content: "支払中..."
    });
    loader.present();
    Payjp.createToken(card, (s, response) => {
      if (response.error) {
        loader.dismiss();
        let alert = this.alertCtrl.create({
          title: "クレジットカード情報の取得に失敗しました。",
          buttons: ["OK"]
        });
        alert.present();
      } else {
        let user = this.session.getUser();
        this.mysql.query("pay/charge.php", { token: response.id, room: this.room.id, uid: user.uid, na: user.displayName }).subscribe((data: any) => {
          loader.dismiss();
          if (data.msg === "ok") {
            this.room.allow = "1";
            this.session.login(user);
            let alert = this.alertCtrl.create({
              title: 'ようこそ「' + this.room.na + "」へ",
              message: '定額課金の処理が正常に行われました。',
              buttons: [
                {
                  role: 'cancel',
                  handler: () => {
                    this.session.joinRoom(this.room);
                  }
                }
              ]
            });
            alert.present();
          } else {
            let alert = this.alertCtrl.create({
              title: "定額課金の処理に失敗しました。お問い合わせください。",
              message: data.error,
              buttons: ["OK"]
            });
            alert.present();
          }
        });
      }
    });
  }
}
