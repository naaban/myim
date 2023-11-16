import { NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nPipe } from './i18n.pipe';
import { I18nService } from './i18n.service';
import { i18nConfigService } from './i18n-config.service';
import { I18nComponent } from './i18n.component';



@NgModule({
    declarations: [
        I18nComponent,
        I18nPipe
    ],
    exports : [
        I18nComponent,
        I18nPipe
    ],
    imports: [
        CommonModule
    ],
   
})
export class I18nModule {

    static forRoot(config: any) {
        return {
            ngModule: I18nModule,
            providers: [
                I18nService,
                {
                    provide: i18nConfigService,
                    useValue: config
                }
            ]
        }
    }
}
