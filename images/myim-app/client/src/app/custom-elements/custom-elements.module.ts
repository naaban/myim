import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown/dropdown.component';
import { I18nModule } from '../utils/language/i18n.module';
import { BannerComponent } from './banner/banner.component';
import { ShortcutComponent } from './shortcut/shortcut.component';
import { HeaderComponent } from './header/header.component';
import { FormComponent } from './form/form.component';



@NgModule({
  declarations: [
    DropdownComponent,
    BannerComponent,
    ShortcutComponent,
    HeaderComponent,
    FormComponent,
  ],
  exports : [
    DropdownComponent,
    BannerComponent,
    ShortcutComponent
  ],
  imports: [
    CommonModule,
    I18nModule
  ]
})
export class CustomElementsModule { }
