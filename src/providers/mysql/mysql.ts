import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class MysqlProvider {
  constructor(public http: HttpClient) {
    console.log("mysql");
  }
  room(uid: string): Observable<Object> {
    //return this.http.get("https://localhost/public_html/room.php", { params: { parent: `${parent}` } });
    return this.http.get("https://localhost/public_html/room.php", { params: { uid: uid } });
  }
  pay(token: string): Observable<Object> {
    //return this.http.get("https://localhost/public_html/room.php", { params: { parent: `${parent}` } });
    return this.http.get("https://localhost/public_html/pay/charge.php", { params: { token: token } });
  }
}
