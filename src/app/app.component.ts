import { Component } from '@angular/core';
import * as L from 'leaflet';
import * as omnivore from '@mapbox/leaflet-omnivore';
import extract from 'extract-zip';
import JSZip from 'jszip/dist/jszip';
import JSZipUtils from 'jszip-utils/dist/jszip-utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public layers: L.Layer[]

  public options = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 5,
    center: L.latLng([ 46.879966, -121.726909 ])
  };



  public layersControl = {
    baseLayers: {
      'Open Street Map': L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
      'Open Cycle Map': L.tileLayer('http://{s}.tile.opencyclemap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    },
    overlays: {
      'Big Circle': L.circle([ 46.95, -122 ], { radius: 5000 }),
      'Big Square': L.polygon([[ 46.8, -121.55 ], [ 46.9, -121.55 ], [ 46.9, -121.7 ], [ 46.8, -121.7 ]])
    }
  }

  public onMapReady(map: L.Map) {

  JSZipUtils.getBinaryContent('./assets/z.kmz', function(err, data) {
    if (err) {
      alert(err);
      return;
    }
    try {
      JSZip.loadAsync(data)
      .then(function(z) {
        return z.file(/.*\.kml/)[0].async('string')
      })
      .then(function success(text) {
        const p = omnivore.kml.parse(text).addTo(map);
        map.fitBounds(p.getBounds());
        p.eachLayer(function(layer){
          layer.bindTooltip('<div style="width:300px">' + layer.feature.properties.description + '</div>');
        });
      },
      function error(e) {
        alert(e);
      });
    } catch (e) {
      alert(e);
    }
  });


    // const a = omnivore.kml('./assets/s.kml').addTo(map);
    // console.log(`a`, a);
    // map.fitBounds(a.getBounds());
  }
}
