import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public w3: any = 'http://cgi.uru.ac.th/geoserver/udparcel/ows?service=WFS&version=1.0.0&request=GetFeature';
  public url: any = 'http://202.29.52.232/service/ud_parcel.php';
  // public url: any = 'http://103.40.148.133/service/ud_parcel.php';

  constructor(
    private http: HttpClient
  ) {
  }

  getParcel(lon: number, lat: number) {
    return new Promise((resolve, reject) => {
      this.http.get(this.w3 + '&typeName=udparcel:building_4326&CQL_FILTER=INTERSECTS(geom,POINT(' +
        lon + '%20' + lat + '))&outputFormat=application%2Fjson')
        .subscribe((res: any) => {
          resolve(res);
        }, (error) => {
          reject(error);
        });
    });
  }

  getAllParcel() {
    return new Promise((resolve, reject) => {
      this.http.get(this.url)
        .subscribe((res: any) => {
          resolve(res);
        }, (error) => {
          reject(error);
        });
    });
  }

  getLikeParcel(txt1: string, txt2: string) {
    return new Promise((resolve, reject) => {
      this.http.get(this.url + '?val1=' + txt1 + '&val2=' + txt2)
        .subscribe((res: any) => {
          resolve(res);
        }, (error) => {
          reject(error);
        });
    });
  }

  getParcelBuffer(lon: number, lat: number, r: number) {
    return new Promise((resolve, reject) => {
      this.http.get(this.w3 + '&typeName=udparcel:building_4326&CQL_FILTER=DWITHIN(geom,POINT(' +
        lon + '%20' + lat + '),' + r + ',meters)&outputFormat=application%2Fjson')
        .subscribe((res: any) => {
          resolve(res);
        }, (error) => {
          reject(error);
        });
    });
  }

  getCommu() {
    return new Promise((resolve, reject) => {
      this.http.get(this.w3 + '&typeName=udparcel:boundary_comm_4326&outputFormat=application%2Fjson')
        .subscribe((res: any) => {
          resolve(res);
        }, (error) => {
          reject(error);
        });
    });
  }

  // getAccCheckpoint(): Observable<Item[]> {
  //   return this.http.get(this.url + '&typeName=hms:ac_checkpoint2018_v&outputFormat=application%2Fjson')
  //     .map(res => <Item[]>res);
  // }
}
