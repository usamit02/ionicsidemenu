import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class MysqlProvider {

  constructor(public http: HttpClient) {
  }
  room(parent: number): Observable<Object> {
    //let params = new HttpParams().append("parent", "${parent}");
    return this.http.get("https://localhost/public_html/room.php", { params: { parent: `${parent}` } });
  }
}
