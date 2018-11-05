import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ColdObservable } from 'rxjs/testing/ColdObservable';
@Injectable()
export class MysqlProvider {
  //url: string = "bloggersguild.cf";
  url: string = "localhost/public_html";
  constructor(public http: HttpClient) {
  }
  room(uid: string): Observable<Object> {
    return this.http.get("https://" + this.url + "/room.php", { params: { uid: uid } });
  }
  pay(token: string, price: string, room: string, user): Observable<Object> {
    return this.http.get("https://" + this.url + "/pay/charge.php", {
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
    return this.http.get("https://" + this.url + "/bookmark.php", { params: { uid: uid, rid: rid, bookmark: bookmark } });
  }
  story(id: string): Observable<Object> {
    return this.http.get("https://" + this.url + "/story.php", { params: { id: id } });
  }
}
