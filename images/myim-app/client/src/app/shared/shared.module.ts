import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown/dropdown.component';
import { I18nModule } from '../utils/language/i18n.module';
import { BannerComponent } from './banner/banner.component';
import { ShortcutComponent } from './shortcut/shortcut.component';
import { HeaderComponent } from './header/header.component';
import { FormComponent } from './form/form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



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
    ShortcutComponent,
    FormComponent
  ],
  imports: [
    CommonModule,
    I18nModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }
