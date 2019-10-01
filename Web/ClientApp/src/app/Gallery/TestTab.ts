import { Component, forwardRef, Inject } from '@angular/core';
import { Gallery } from './Gallery';

@Component(
    {
        template: `<input type="text" [ngModel]="Model[0]" [dtModelErrors]="Model[1]"/>`
    })
export class TestTab0
{
    Model: [string, any];

    constructor(
        @Inject(forwardRef(() => Gallery))
        gallery: Gallery
        )
    {
        this.Model = <[string, any]>gallery.tabbedViewModel[0];
    }
}

@Component(
    {
        template: `<input type="text" [ngModel]="Model[0]" [dtModelErrors]="Model[1]"/>`
    })
export class TestTab1
{
  Model: [string, any];

  constructor(
    @Inject(forwardRef(() => Gallery))
    gallery: Gallery
  )
  {
    this.Model = <[string, any]>gallery.tabbedViewModel[1];
  }
}
