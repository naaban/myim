import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainRoutingModule } from './main.routing';
import { PartiesComponent } from './parties/parties.component';
import { ItemsComponent } from './items/items.component';
import { I18nModule } from '../utils/language/i18n.module';
import { I18nPipe } from '../utils/language/i18n.pipe';
import { ShortcutComponent } from '../custom-elements/shortcut/shortcut.component';
import { BannerComponent } from '../custom-elements/banner/banner.component';
import { CustomElementsModule } from '../custom-elements/custom-elements.module';
import { PartyModule } from './parties/party.module';
import { ViewPartyComponent } from './parties/view-party/view-party.component';


@NgModule({
  declarations: [
    DashboardComponent,
    ItemsComponent,
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    PartyModule,
    I18nModule,
    CustomElementsModule
  ]
})
export class MainModule { }
