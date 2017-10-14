import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

import * as turf from '@turf/turf';

@Injectable()
export class MapService {

  private mapDataSource = new Subject<any>();
  private biggestAreaSource = new Subject<any>();
  private smallestAreaSource = new Subject<any>();

  public mapData$ = this.mapDataSource.asObservable();
  public biggestArea$ = this.biggestAreaSource.asObservable();
  public smallestArea$ = this.smallestAreaSource.asObservable();


  constructor(private http: HttpClient) { }

  public loadData() {
    this.http.get('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_populated_places_simple.geojson').subscribe(data => {
      this.mapDataSource.next(data);
    });
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

  public biggerAreaSize(areasLayers) {
    const areasGeosJSON = areasLayers.toGeoJSON() as any,
    areasSizes = this.getAreasSizes(areasGeosJSON);

    const biggestArea = Math.max(...areasSizes.map(x => x.areaSize));

    const biggestAreaFeature = areasGeosJSON.features
    .find(feature => {
      return areasSizes
      .find(a => a.areaSize === biggestArea).featureId === feature.id;
    });

    this.biggestAreaSource.next(biggestAreaFeature);
  }

  public smallerAreaSize(areasLayers) {
    const areasGeosJSON = areasLayers.toGeoJSON() as any,
    areasSizes = this.getAreasSizes(areasGeosJSON);

    const smallestArea = Math.min(...areasSizes.map(x => x.areaSize));

    const smallestAreaFeature = areasGeosJSON.features
    .find(feature => {
      return areasSizes
      .find(a => a.areaSize === smallestArea).featureId === feature.id;
    });

    this.smallestAreaSource.next(smallestAreaFeature);
  }

}
