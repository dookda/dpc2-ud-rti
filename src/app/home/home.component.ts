import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import { DataService } from '../services/data.service';
import { resolve, reject } from 'q';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('content') content: ElementRef;
  public map: any;
  public center: any;
  public zoom: any;

  public grod: any;
  public gter: any;
  public ghyb: any;
  public mbox: any;

  public tam: any;
  public amp: any;
  public pro: any;
  public commu: any;
  public parcel: any;
  public poly: any;

  public proCheck: any;
  public ampCheck: any;
  public tamCheck: any;
  public commuCheck: any;
  public parcelCheck: any;

  public circle: any;
  public radius: number;
  public parcelBuff: any;

  public p: any;
  public d: any;

  public houseData: any;
  public term: any;

  constructor(
    private dataService: DataService
  ) {
  }

  ngOnInit() {
    this.center = [17.620254, 100.097597];
    this.zoom = 14;
    this.loadmap();
    // this.loadParcel();
    // this.loadCommu();

    // this.searchHouse();
  }

  loadmap() {
    this.map = L.map('map', {
      center: this.center,
      zoom: this.zoom
    });

    // base map
    this.mbox = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy;',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoiY3NrZWxseSIsImEiOiJjamV1NTd1eXIwMTh2MzN1bDBhN3AyamxoIn0.Z2euk6_og32zgG6nQrbFLw'
    });

    this.grod = L.tileLayer('http://{s}.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', {
      maxZoom: 18,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
    this.ghyb = L.tileLayer('http://{s}.google.com/vt/lyrs=y,m&x={x}&y={y}&z={z}', {
      maxZoom: 18,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
    this.gter = L.tileLayer('http://{s}.google.com/vt/lyrs=t,m&x={x}&y={y}&z={z}', {
      maxZoom: 18,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    // overlay map
    const mapUrl = 'http://map.nu.ac.th/geoserver-hgis/ows?';
    const cgiUrl = 'http://www.cgi.uru.ac.th/geoserver/ows?';
    // const cgiUrl = 'http://103.40.148.133/gs-ud/ows?';

    this.parcel = L.tileLayer.wms(cgiUrl, {
      layers: 'udparcel:building_4326',
      format: 'image/png',
      transparent: true,
      zIndex: 5,
      // CQL_FILTER: 'prov_code=53'
    });

    this.commu = L.tileLayer.wms(cgiUrl, {
      layers: 'udparcel:boundary_comm_4326',
      format: 'image/png',
      transparent: true,
      zIndex: 5,
      // CQL_FILTER: 'prov_code=53'
    });

    this.pro = L.tileLayer.wms(mapUrl, {
      layers: 'hgis:dpc9_province_4326',
      format: 'image/png',
      transparent: true,
      zIndex: 5,
      CQL_FILTER: 'prov_code=53'
    });

    this.amp = L.tileLayer.wms(mapUrl, {
      layers: 'hgis:dpc9_amphoe_4326',
      format: 'image/png',
      transparent: true,
      zIndex: 5,
      CQL_FILTER: 'prov_code=53'
    });

    this.tam = L.tileLayer.wms(mapUrl, {
      layers: 'hgis:dpc9_tambon_4326',
      format: 'image/png',
      transparent: true,
      zIndex: 5,
      CQL_FILTER: 'prov_code=53'
    });

    const baseLayers = {
      'map box': this.mbox,
      'แผนที่ถนน': this.grod.addTo(this.map),
      'แผนที่ภาพดาวเทียม': this.ghyb,
      'แผนที่ภูมิประเทศ': this.gter,
    };

    const overlayLayers = {
      'ขอบเขตจังหวัด': this.pro.addTo(this.map),
      'ขอบเขตอำเภอ': this.amp.addTo(this.map),
      'ขอบเขตตำบล': this.tam.addTo(this.map),
      'ขอบเขตพื้นที่ชุมชน': this.parcel.addTo(this.map),
      'แปลงที่ดิน': this.commu.addTo(this.map),
    };

    // L.control.layers(baseLayers, overlayLayers).addTo(this.map);
    this.proCheck = true;
    this.ampCheck = true;
    this.tamCheck = true;
    this.commuCheck = true;
    this.parcelCheck = true;



    this.map.on('click', (e) => {
      const latlng = e.latlng;
      if (this.parcelCheck) {
        // popupInfo
        this.dataService.getParcel(latlng.lng, latlng.lat).then((res: any) => {
          if (res.totalFeatures > 0) {
            L.popup({
              maxWidth: 200, // offset: [5, -25]
            }).setLatLng([latlng.lat, latlng.lng]).setContent('<span id="kanit13">อาคารเลขที่:</span>: ' +
              res.features[0].properties.hs_no +
              '<br> <span id="kanit13">ชื่อชุมชน:</span>: ' +
              res.features[0].properties.commu_name).openOn(this.map);
          }
        });
        // buffer
        if (this.radius > 0) {
          if (this.circle) {
            this.map.removeLayer(this.circle);
            this.circle = L.circle([latlng.lat, latlng.lng], { radius: this.radius }).addTo(this.map);
            this.loadDataBuffer(latlng.lng, latlng.lat, this.radius);
          } else {
            this.circle = L.circle([latlng.lat, latlng.lng], { radius: this.radius }).addTo(this.map);
            this.loadDataBuffer(latlng.lng, latlng.lat, this.radius);
          }
        }
      }
    });
  }

  async loadDataBuffer(lon: number, lat: number, r: number) {
    await this.dataService.getParcelBuffer(lon, lat, r).then((res: any) => {
      this.parcelBuff = res.features;
      this.showWfs(res.features);
    });
  }

  showWfs(json: any) {
    if (this.poly) {
      this.deleteWfs();
      this.loadWfs(json);
    } else {
      this.loadWfs(json);
    }
  }

  deleteWfs() {
    this.map.eachLayer((l) => {
      if (l.chk === 'true') {
        this.map.removeLayer(l);
      }
    });
  }

  loadWfs(json: any) {
    json.forEach((f) => {
      const arr1 = [];
      const arr2 = [];
      const i = f.geometry.coordinates[0][0];
      for (const a of i) {
        const b = [];
        b.push(a[1], a[0]);
        arr2.push(b);
      }
      arr1.push(arr2);
      this.poly = L.polygon(arr1, {
        weight: 1,
        fillOpacity: 0.7,
        color: 'cyan',
        dashArray: '3'
      });
      this.poly.chk = 'true';
      this.map.addLayer(this.poly);
    });
  }

  selectBuffer(b) {
    this.parcelBuff = [];
    this.radius = b;
    if (this.circle) {
      this.map.removeLayer(this.circle);
      this.deleteWfs();
    }
  }

  onHouseClick(a: any) {
    this.map.setView([a.cen_y, a.cen_x], 18);
    L.popup({
      maxWidth: 200,
    }).setLatLng([a.cen_y, a.cen_x])
      .setContent('<span id="kanit13">อาคารเลขที่: </span>: ' + a.hs_no +
        '<br> <span id="kanit13">ชื่อชุมชน: </span>: ' + a.commu_name)
      .openOn(this.map);
  }

  onClickList(p: any, lat: number, lon: number, txt1: any, txt2: any) {
    const arr = [];
    for (const i of p) {
      if (i) {
        const a = i.reverse();
        arr.push(a);
      }
    }
    this.map.fitBounds(arr);
    L.popup({
      maxWidth: 200, // offset: [5, -25]
    }).setLatLng([lat, lon])
      .setContent('<span id="kanit13">อาคารเลขที่: </span>: ' + txt1 +
        '<br> <span id="kanit13">ชื่อชุมชน: </span>: ' + txt2)
      .openOn(this.map);
  }

  async searchHouse(e) {
    let val1;
    let val2;

    if (e !== '') {
      const txt = e.split(' ');
      if (txt.length === 1) {
        val1 = txt[0];
        val2 = '';
      } else {
        val1 = txt[0];
        val2 = txt[1];
      }

      await this.dataService.getLikeParcel(val1, val2).then((res: any) => {
        console.log('tt');
        this.houseData = res;
      }, error => {
        console.log(error);
      });
    } else {
      console.log('null');
    }
  }

  onCheckJson(lyr: string, isChecked: boolean) {
    if (isChecked) {
      if (lyr === 'pro') {
        this.map.addLayer(this.pro);
        this.proCheck = true;
      } else if (lyr === 'amp') {
        this.map.addLayer(this.amp);
        this.ampCheck = true;
      } else if (lyr === 'tam') {
        this.map.addLayer(this.tam);
        this.tamCheck = true;
      } else if (lyr === 'commu') {
        this.map.addLayer(this.commu);
        this.commuCheck = true;
      } else if (lyr === 'parcel') {
        this.map.addLayer(this.parcel);
        this.map.addLayer(this.poly);
        this.parcelCheck = true;
      }
    } else {
      if (lyr === 'pro') {
        this.map.removeLayer(this.pro);
        this.proCheck = false;
      } else if (lyr === 'amp') {
        this.map.removeLayer(this.amp);
        this.ampCheck = false;
      } else if (lyr === 'tam') {
        this.map.removeLayer(this.tam);
        this.tamCheck = false;
      } else if (lyr === 'commu') {
        this.map.removeLayer(this.commu);
        this.commuCheck = false;
      } else if (lyr === 'parcel') {
        this.map.removeLayer(this.parcel);
        this.map.removeLayer(this.poly);
        this.parcelCheck = false;
      }
    }
  }

  onSelect(lyr) {
    const lyrBase = [
      { id: 'grod', lyr: this.grod },
      { id: 'ghyb', lyr: this.ghyb },
      { id: 'gter', lyr: this.gter },
      { id: 'mbox', lyr: this.mbox }
    ];

    for (const i in lyrBase) {
      if (lyrBase[i].id === lyr) {
        // console.log('yes', lyrBase[i].lyr);
        this.map.addLayer(lyrBase[i].lyr);
      } else {
        // console.log('no', lyrBase[i].lyr);
        this.map.removeLayer(lyrBase[i].lyr);
      }
    }
  }

  printMap() {
    window.print();
  }




}
