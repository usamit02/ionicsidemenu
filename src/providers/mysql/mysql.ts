import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ColdObservable } from 'rxjs/testing/ColdObservable';
@Injectable()
export class MysqlProvider {
  url: string = "https://bloggersguild.cf/";
  //url: string = "http://localhost/public_html/";
  constructor(private http: HttpClient) {
  }
  query(url: string, params: any): Observable<Object> {
    return this.http.get(this.url + url, { params: params });
  }
  room(uid: string): Observable<Object> {
    return this.http.get(this.url + "room.php", { params: { uid: uid } });
  }
  pay(token: string, price: string, room: string, user): Observable<Object> {
    return this.http.get(this.url + "pay/charge.php", {
      params: {
        token: token,
        price: price,
        room: room,
        userId: user.uid,
        userName: user.displayName
      }
    });
  }
  addBookmark(uid: string, rid: string, bookmark: string): Observable<Object> {
    return this.http.get(this.url + "bookmark.php", { params: { uid: uid, rid: rid, bookmark: bookmark } });
  }
}
