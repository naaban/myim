import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartiesComponent } from './parties.component';
import { CustomElementsModule } from 'src/app/custom-elements/custom-elements.module';
import { PartyRoutingModule } from './party.routing';
import { I18nModule } from 'src/app/utils/language/i18n.module';
import { AddPartyComponent } from './add-party/add-party.component';
import { ViewPartyComponent } from './view-party/view-party.component';


@NgModule({
    declarations: [
        PartiesComponent,
        AddPartyComponent,
        ViewPartyComponent
    ],
    imports: [
        CommonModule,
        PartyRoutingModule,
        CustomElementsModule,
        I18nModule,
    ]
})
export class PartyModule { }
