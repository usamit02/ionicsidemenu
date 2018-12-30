import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { VideoPage } from '../pages/video/video';
import { GridPage } from '../pages/grid/grid';
import { PayPage } from '../pages/pay/pay';
import { StoryPage } from '../pages/story/story';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { SocketIoModule } from 'ng-socket-io';
import { SessionProvider } from '../providers/session/session';
import { MysqlProvider } from '../providers/mysql/mysql';
import { firebaseConfig, config } from '../environment';
import { SafePipe } from '../pipe/safe';
@NgModule({
  declarations: [
    MyApp,
    HomePage,
    VideoPage,
    GridPage,
    PayPage,
    StoryPage,
    SafePipe
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    SocketIoModule.forRoot(config)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    VideoPage,
    GridPage,
    PayPage,
    StoryPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    SessionProvider,
    MysqlProvider
  ]
})
export class AppModule { }
