import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { LayoutRoutingModule } from './layout.routing';
import { SideNavComponent } from './side-nav/side-nav.component';
import { LoaderModule } from '../loader/loader.module';
import { I18nPipe } from '../utils/language/i18n.pipe';
import { I18nComponent } from '../utils/language/i18n.component';
import { I18nModule } from '../utils/language/i18n.module';


@NgModule({
  declarations: [
    LayoutComponent,
    SideNavComponent,
  ],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    LoaderModule,
    I18nModule
  ],
  exports : []
})
export class LayoutModule { }
