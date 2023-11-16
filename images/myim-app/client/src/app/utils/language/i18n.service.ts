import { Injectable, Inject } from '@angular/core';
import { i18nConfigService } from './i18n-config.service';
@Injectable(
    // { providedIn: 'root' }
)
export class I18nService {

    currentLanguage: string | null = '';

    constructor(@Inject(i18nConfigService) public langList: any) {
        this.initLang();
    }

    initLang() {
        if (localStorage.getItem('lang')) {
            console.log('getting old lang')
            this.currentLanguage = localStorage.getItem('lang');
        } else {
            localStorage.setItem('lang', 'EN');
            this.currentLanguage = 'EN';
        }
    }

    getString(key: any) {
        return this.langList[this.langList.map((e: any, i: number) => e.lang === this.currentLanguage ? i : null).filter((e: any) => e !== null)[0]].file[key];
    }

    languageChange(lang: any) {
        this.currentLanguage = lang;
        localStorage.setItem('lang', lang);
    }
}
