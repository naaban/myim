import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader.component';
import { LoaderService } from './loader.service';



@NgModule({
  declarations: [
    LoaderComponent
  ],
  exports : [
    LoaderComponent
  ],
  imports: [
    CommonModule
  ],
  providers : [
    LoaderService
  ]
})
export class LoaderModule { }
