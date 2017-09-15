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
  private map: L.Map;

  public onMapReady(map: L.Map) {
    this.map = map;
  }

  private process(url, type) {
    if (type === 'kmz') {
      this.kmzToGeoJSON(url);
    } else if (type === 'kml') {
      this.kmlToGeoJSON(url)
    }
  }

  private showLayersOnMap(layers) {
    layers.addTo(this.map);
    if (layers.getBounds().isValid()) {
      this.map.fitBounds(layers.getBounds());
    }
    layers.eachLayer((layer) => {
      layer.bindTooltip('<div style="width:300px">' + layer.feature.properties.description + '</div>');
    });
  }

  public fileHandler(event) {
    const file = event.target.files[0];
    const fileUrl = window.URL.createObjectURL(file);
    this.process(fileUrl, file.name.indexOf('kmz') > -1 ? 'kmz' : 'kml');
  }

  private kmzToGeoJSON(url) {
    JSZipUtils.getBinaryContent(url, (err, data) => {
      if (err) {
        alert(err);
        return;
      }
      try {
        JSZip.loadAsync(data)
        .then((z) => {
          return z.file(/.*\.kml/)[0].async('string');
        })
        .then((text) => {
          const layers = omnivore.kml.parse(text);
          this.showLayersOnMap(layers);
          window.URL.revokeObjectURL(url);
        },
        function error(e) {
          alert(e);
        });
      } catch (e) {
        alert(e);
      }
    });
  }

  private kmlToGeoJSON(url) {
    const layer = omnivore.kml(url)
    .on('ready', (data) => {
        this.showLayersOnMap(data.target);
        window.URL.revokeObjectURL(url);
    })
    .on('error', (err) => {
        console.log(err);
    });
    // .addTo(map);
  }
}
