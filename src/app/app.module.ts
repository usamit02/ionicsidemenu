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
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';
import { SessionProvider } from '../providers/session/session';
import { MysqlProvider } from '../providers/mysql/mysql';
export const firebaseConfig = {
  apiKey: 'AIzaSyAvD0ftnENGOCvE9cOPB8AklV7JeMY4cfg',
  authDomain: 'blogersguild1.firebaseapp.com',
  databaseURL: 'https://blogersguild1.firebaseio.com',
  projectId: 'blogersguild1',
  storageBucket: 'blogersguild1.appspot.com',
  messagingSenderId: '1091781872346'
};
//const config: SocketIoConfig = { url: 'http://localhost:3002', options: {} };
const config: SocketIoConfig = { url: 'https://www.clife.cf:3002', options: {} };
@NgModule({
  declarations: [
    MyApp,
    HomePage,
    VideoPage,
    GridPage,
    PayPage,
    StoryPage
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
