import { AfterViewInit, Component, NgZone } from '@angular/core';
import * as L from 'leaflet';
import * as geoJson from 'geojson';
import { Observable, Subscriber } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MunicipalitiesComponent } from '../municipalities/municipalities.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {

  map: any;
  geojson: any;
  info: any
  _div: any;
  myFlagForSlideToggle: boolean = false;
  geoJsonData: any = {};

  constructor(private _httpClient: HttpClient,
    private router: Router) { }

  ngOnInit() { }

  public ngAfterViewInit(): void {
    this.loadMap();

    this.info = new L.Control();

    this.info.onAdd = (map: any) => {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.info.update();
      return this._div;
    };


    // method that we will use to update the control based on feature properties passed
    this.info.update = (props: any) => {
      this._div.innerHTML = '<div style="padding: 5px; border: 1px solid black; background-color:#f6f6f6"><h4>Mexico</h4>' + (props ?
        '<b>' + props.state_name + '</b><br />' + props.density + '%'
        : 'Hover over a state</div>');
    };

    this.info.addTo(this.map);

  
    this._httpClient.get("../assets/data/states.geojson").subscribe((response) => {
      this.geoJsonData = <geoJson.GeoJsonObject>response;
      this.createMap();
    })

    var legend = new L.Control({ position: 'bottomleft' });
    legend.onAdd = (map) => {

      let div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        labels = [];

      div.innerHTML += '<div style="background-color: white;"';
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="vertical-align:text-top;margin-top:-5px;display:inline-block;margin-right:10px;height:20px;width:20px;background:' + this.getColor(grades[i] + 1) + '"></i>' +
          '<span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '</span><br>' : '+');

      }

      return div;

    };

    legend.addTo(this.map);
  }

   highlightFeature = (e: any) => {
    const layer = e.target;

    layer.setStyle({
      weight: 3,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.2
    });

    if (!L.Browser.ie && !L.Browser.edge) {
      layer.bringToFront();
    }

    this.info.update(layer.feature.properties);
  }
  
   resetHighlight = (e: any) => {
    this.geojson.resetStyle(e.target);
    this.info.update();
  }

  createMap() {
    this.geojson = L.geoJSON(this.geoJsonData, {
      style: (feature: any) => {
        return {
          fillColor: !this.myFlagForSlideToggle ? '#CFCFCF' : this.getColor(feature.properties.density),
          weight: 4,
          opacity: 1,
          color: 'black',
          dashArray: '0',
          fillOpacity: 1,
        };
      },
      onEachFeature: (feature, layer) => {          
        layer.on({
          mouseover: this.highlightFeature,
          mouseout: this.resetHighlight,
          click: () => {
            this.clickState(feature)
          }
        });
      }
    }).addTo(this.map);
  }

  changeMapColor() {
    this.myFlagForSlideToggle = !this.myFlagForSlideToggle;
    this.createMap();
  }

  private clickState(e: any) {
    // this.router.navigateByUrl('/municipalities/' + e.properties.state_name + '/' + e.properties.state_code);
    this.router.navigate(['municipalities', e.properties.state_code, e.properties.state_name])
  }

  private loadMap(): void {
    this.map = L.map('map', { zoomControl: false }).setView([24.8, -104], 5.5);
    L.tileLayer('', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: environment.mapbox.accessToken,
    }).addTo(this.map);

    const icon = L.icon({
      iconUrl: 'https://res.cloudinary.com/rodrigokamada/image/upload/v1637581626/Blog/angular-leaflet/marker-icon.png',
      shadowUrl: 'https://res.cloudinary.com/rodrigokamada/image/upload/v1637581626/Blog/angular-leaflet/marker-shadow.png',
      popupAnchor: [13, 0],
    });

  }


  getColor(d: any) {
    return d > 1000
      ? '#ED7890'
      : d > 500
        ? '#ED7890'
        : d > 200
          ? '#E09D60'
          : d > 100
            ? '#F3CD74'
            : d > 50
              ? '#CFCFCF'
              : d > 20
                ? '#CFCFCF'
                : d > 10
                  ? '#CFCFCF'
                  : '#CFCFCF';
  }



}
