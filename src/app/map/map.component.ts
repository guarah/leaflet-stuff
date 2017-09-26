import { MapService } from './map.service';
import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import * as omnivore from '@mapbox/leaflet-omnivore';
import extract from 'extract-zip';
import JSZip from 'jszip/dist/jszip';
import JSZipUtils from 'jszip-utils/dist/jszip-utils';
import * as turf from '@turf/turf';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  public addressSuggestions = [
    'Itapema', 'Balneário Camboriú'
  ]
  public address = null;
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

  private areasLayers: L.LayerGroup;

  constructor(private mapService: MapService) { }

  ngOnInit() {
    this.mapService.mapData$.subscribe(data => {
      console.log('data', data);
      const defaultIcon = L.icon({
        iconUrl: 'assets/map-marker.png',
        iconSize: [40, 40]
      });
      const geoJsonLayer = L.geoJSON(data, {
        onEachFeature: function(feature, layer){
          (layer as any).setIcon(defaultIcon);
        }
      }).addTo(this.map);

    });
  }

  public onMapReady(map: L.Map) {
    this.map = map;
    this.mapService.loadData();
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
          this.areasLayers = layers;
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

  public selectAddress(event) {
    console.log(event);
  }

  private getAreasSizes(geoJson) {
    return geoJson.features.reduce((acc, item) => {
      acc.push({
        featureId: item.id,
        areaSize: turf.area(item)
      });
      return acc;
    }, []);
  }

  private biggerAreaSize() {
    if (this.areasLayers) {
      const areasGeosJSON = this.areasLayers.toGeoJSON() as any,
      areasSizes = this.getAreasSizes(areasGeosJSON);

      const biggestArea = Math.max(...areasSizes.map(x => x.areaSize));

      const biggestAreaFeature = areasGeosJSON.features
      .find(feature => {
        return areasSizes
        .find(a => a.areaSize === biggestArea).featureId === feature.id;
      });

      this.map.fitBounds(L.geoJSON(biggestAreaFeature).getBounds());
      console.log('biggest area:', biggestArea);
    }
  }

  private smallerAreaSize() {
    if (this.areasLayers) {
      const areasGeosJSON = this.areasLayers.toGeoJSON() as any,
      areasSizes = this.getAreasSizes(areasGeosJSON);

      const smallestArea = Math.min(...areasSizes.map(x => x.areaSize));

      const smallestAreaFeature = areasGeosJSON.features
      .find(feature => {
        return areasSizes
        .find(a => a.areaSize === smallestArea).featureId === feature.id;
      });

      this.map.fitBounds(L.geoJSON(smallestAreaFeature).getBounds());
      console.log('smallest area:', smallestArea);
    }
  }
}
