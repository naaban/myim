import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { I18nService } from 'src/app/utils/language/i18n.service';

@Component({
  selector: 'myim-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {


  @Input()
  public values: any[] = [];

  @Input()
  public key!: any;

  @Output()
  public onItemSelected: EventEmitter<any> = new EventEmitter();

  @Input()
  public placeholder!: string;

  @Input()
  public createBtnText!: string;


  public selected!: any;

  constructor(public i18nService: I18nService) { }

  ngOnInit(): void {
  }

  onItemSelect(val: any) {
    this.selected = val;
    this.onItemSelected.emit(val)
  }

}
