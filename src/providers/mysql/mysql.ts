import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class MysqlProvider {
  constructor(public http: HttpClient) {
  }
  room(uid: string): Observable<Object> {
    //return this.http.get("https://localhost/public_html/room.php", { params: { parent: `${parent}` } });
    return this.http.get("https://localhost/public_html/room.php", { params: { uid: uid } });
  }
  pay(token: string, price: string, room: string, user): Observable<Object> {
    return this.http.get("https://localhost/public_html/pay/charge.php", {
      params: {
        token: token,
        price: price,
        room: room,
        userId: user.uid,
        userName: user.displayName
      }
    });
  }
}
