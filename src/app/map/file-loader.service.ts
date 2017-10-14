import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';

import * as omnivore from '@mapbox/leaflet-omnivore';
import extract from 'extract-zip';
import JSZip from 'jszip/dist/jszip';
import JSZipUtils from 'jszip-utils/dist/jszip-utils';

@Injectable()
export class FileLoaderService {

  private loadedLayersSource = new Subject<any>();
  public loadedLayes$ = this.loadedLayersSource.asObservable();

  constructor() { }

  public process(url, type) {
    if (type === 'kmz') {
      this.kmzToGeoJSON(url);
    } else if (type === 'kml') {
      this.kmlToGeoJSON(url)
    }
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
          this.loadedLayersSource.next(layers);
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
      this.loadedLayersSource.next(data.target);
      window.URL.revokeObjectURL(url);
    })
    .on('error', (err) => {
        console.log(err);
    });
  }

}
