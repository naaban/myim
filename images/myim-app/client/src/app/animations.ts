import {
    trigger, style, transition,
    animate, query, sequence, stagger
  } from '@angular/animations';
  
  export const DropDownMenu = trigger('dropDownMenu', [
    transition(':enter', [
      style({ height: 0, overflow: 'hidden' }),
      query('.sub-menu-item', [
        style({ opacity: 0, transform: 'translateY(-200px)' })
      ]),
      sequence([
        animate('100ms', style({ height: '*' })),
        query('.sub-menu-item', [
          stagger(50, [
            animate('200ms', style({ opacity: 1, transform: 'none' }))
          ])
        ])
      ])
    ]),
  
    transition(':leave', [
      style({ height: '*', overflow: 'hidden' }),
      query('.sub-menu-item', [style({ opacity: 1, transform: 'none' })]),
      sequence([
        query('.sub-menu-item', [
          animate(
            '200ms',
            style({ opacity: 0, transform: 'translateY(-200px)' })
          )
        ]),
        animate('100ms', style({ height: 0 }))
      ])
    ])
  ]);
  