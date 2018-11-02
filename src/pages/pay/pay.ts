import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, LoadingController } from 'ionic-angular';
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
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public mysql: MysqlProvider,
    private session: SessionProvider,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController) {
    this.room = this.navParams.data.room;
  }
  ngOnInit() {
    Payjp.setPublicKey("pk_test_12e1f56f9f92414d7b00af63");
    const toDay = new Date;
    this.date = toDay.getDate();
  }

  pay(card) {
    var loader = this.loadingCtrl.create({
      content: "支払中..."
    });
    loader.present();
    Payjp.createToken(card, (s, response) => {
      if (response.error) {
        loader.dismiss();
        let actionSheet = this.actionSheetCtrl.create({
          title: "クレジットカード情報の取得に失敗しました。",
          buttons: [
            {
              text: response.error.message,
              icon: "exit",
              role: 'destructive',
              handler: () => {

              }
            }
          ]
        });
        actionSheet.present();
      } else {
        let user = this.session.getUser();
        this.mysql.pay(response.id, this.room.price, this.room.id, user).subscribe((data: any) => {
          loader.dismiss();
          if (data.msg === "ok") {
            this.room.allow = "1";
            this.session.login(user);
            let actionSheet = this.actionSheetCtrl.create({
              title: 'ようこそ「' + this.room.na + "」へ",
              buttons: [
                {
                  text: '定額課金の処理が正常に行われました。',
                  icon: "enter",
                  role: 'destructive',
                  handler: () => {
                    this.session.joinRoom(this.room);
                  }
                }
              ]
            });
            actionSheet.present();
          } else {
            let actionSheet = this.actionSheetCtrl.create({
              title: "定額課金の処理に失敗しました。お問い合わせください。",
              buttons: [
                {
                  text: data.error,
                  icon: "exit",
                  handler: () => {
                  }
                }
              ]
            });
            actionSheet.present();
          }
        });
      }
    });
  }
}
