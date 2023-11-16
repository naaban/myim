import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { HomeComponent } from './home/home.component';
import { ModalService } from './services/modal.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import enI18n from './utils/language/en.i18n';
import taI18n from './utils/language/ta.i18n';
import { I18nModule } from './utils/language/i18n.module';


const languages = [
  { lang: 'EN', file: enI18n },
  { lang: 'TA', file: taI18n }
]


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,

  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    I18nModule.forRoot(languages),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [ModalService],
  bootstrap: [AppComponent]
})
export class AppModule { }
