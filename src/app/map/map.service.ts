import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MapService {

  private mapDataSource = new Subject<any>();
  public mapData$ = this.mapDataSource.asObservable();


  constructor(private http: HttpClient) { }

  public loadData() {
    this.http.get('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_populated_places_simple.geojson').subscribe(data => {
      this.mapDataSource.next(data);
      // this.results = data['results'];
    });
  }

}
