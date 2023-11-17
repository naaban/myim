import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartiesComponent } from './parties.component';
import { PartyRoutingModule } from './party.routing';
import { I18nModule } from 'src/app/utils/language/i18n.module';
import { AddPartyComponent } from './add-party/add-party.component';
import { ViewPartyComponent } from './view-party/view-party.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
    declarations: [
        PartiesComponent,
        AddPartyComponent,
        ViewPartyComponent
    ],
    imports: [
        CommonModule,
        PartyRoutingModule,
        I18nModule,
        SharedModule
    ]
})
export class PartyModule { }
