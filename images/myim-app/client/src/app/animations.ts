import {
    trigger, style, transition,
    animate, query, sequence, stagger
  } from '@angular/animations';
  
  export const SlideDown = trigger('slideDown', [
    transition(':enter', [
      style({ height: 0, overflow: 'hidden' }),
      query('.slide-down', [
        style({ opacity: 0, transform: 'translateY(-200px)' })
      ]),
      sequence([
        animate('100ms', style({ height: '*' })),
        query('.slide-down', [
          stagger(50, [
            animate('200ms', style({ opacity: 1, transform: 'none' }))
          ])
        ])
      ])
    ]),
  
    transition(':leave', [
      style({ height: '*', overflow: 'hidden' }),
      query('.slide-down', [style({ opacity: 1, transform: 'none' })]),
      sequence([
        query('.slide-down', [
          animate(
            '200ms',
            style({ opacity: 0, transform: 'translateY(-200px)' })
          )
        ]),
        animate('100ms', style({ height: 0 }))
      ])
    ])
  ]);
  