import { FileLoaderService } from './file-loader.service';
import { MapService } from './map.service';
import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
// import * as C from 'leaflet.markercluster';
import 'leaflet';
import 'leaflet.markercluster';

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

  constructor(
    public mapService: MapService,
    private fileLoaderService: FileLoaderService
  ) { }

  ngOnInit() {
    this.mapService.mapData$.subscribe(data => {
      console.log('data', data);
      const defaultIcon = L.icon({
        iconUrl: 'assets/map-marker.png',
        iconSize: [40, 40]
      });

      const markers = L['markerClusterGroup']({
        iconCreateFunction: function(cluster) {
          const clusterDiv = `
          <div
            style="background-color: #f78c71;
                   border-radius: 50px;
                   height: 30px;
                   width: 30px;
                   text-align: center;
                   line-height: 30px;
                   color: white;
                   font-weight: bold;
                   border: solid 1px #e04118;">
            ${cluster.getChildCount()}
          </div>`;
          return L.divIcon({ html: clusterDiv });
        }
      });

      const geoJsonLayer = L.geoJSON(data, {
        onEachFeature: function(feature, layer){
          (layer as any).setIcon(defaultIcon);
          markers.addLayer(layer);
        }
      }); // .addTo(this.map);

      this.map.addLayer(markers);
    });

    this.mapService.biggestArea$.subscribe(data => {
      this.map.fitBounds(L.geoJSON(data).getBounds());
      console.log('biggest area:', data);
    });

    this.mapService.smallestArea$.subscribe(data => {
      this.map.fitBounds(L.geoJSON(data).getBounds());
      console.log('smallest area:', data);
    });

    this.fileLoaderService.loadedLayes$.subscribe(data => this.showLayersOnMap(data));
  }

  public onMapReady(map: L.Map) {
    this.map = map;
    this.mapService.loadData();
  }

  public fileHandler(event) {
    const file = event.target.files[0];
    const fileUrl = window.URL.createObjectURL(file);
    this.fileLoaderService.process(fileUrl, file.name.indexOf('kmz') > -1 ? 'kmz' : 'kml');
  }

  private showLayersOnMap(layers) {
    this.areasLayers = layers;
    layers.addTo(this.map);
    if (layers.getBounds().isValid()) {
      this.map.fitBounds(layers.getBounds());
    }
    layers.eachLayer((layer) => {
      layer.bindTooltip('<div style="width:300px">' + layer.feature.properties.description + '</div>');
    });
  }

  public selectAddress() {}
}
