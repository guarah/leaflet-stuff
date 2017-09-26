import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { DxAutocompleteModule, DxButtonModule } from 'devextreme-angular';
import { MapService } from 'app/map/map.service';
import { MapComponent } from './map.component';

@NgModule({
  imports: [
    CommonModule,
    LeafletModule.forRoot(),
    DxAutocompleteModule,
    DxButtonModule
  ],
  declarations: [
    MapComponent
  ],
  exports: [
    MapComponent
  ],
  providers: [
    MapService
  ]
})
export class MapModule { }
