import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import * as geoJson from 'geojson';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-municipalities',
  templateUrl: './municipalities.component.html',
  styleUrls: ['./municipalities.component.scss']
})
export class MunicipalitiesComponent implements AfterViewInit {

  map: any;
  geojson: any;
  info: any
  _div: any;

  constructor(private route: ActivatedRoute, private _httpClient: HttpClient,private router: Router) { }

  ngAfterViewInit(): void {
    let stateCode = this.route.snapshot.params['stateCode'];
    let stateName = this.route.snapshot.params['stateName'];

    if (stateCode) {
      this.loadMap();

      this.info = new L.Control();

      var resetHighlight = (e: any) => {
        this.geojson.resetStyle(e.target);
        this.info.update();
      }

      this.info.onAdd = (map: any) => {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.info.update();
        return this._div;
      };

      this.info.update = (props: any) => {
        this._div.innerHTML = '<div style="padding: 5px; border: 1px solid black; background-color:#f6f6f6"><h4>' + stateName + '</h4>' + (props ?
          '<b>' + props.mun_name + '</b><br />' +  '</b><br />' + '<b> IMSI : </b>' + props.imsi + '%' + '</b><br />'
          //'<b>' + 'Municipality Name : ' + props.mun_name + '</b><br />' +  '<b>' + 'No. of Subscribers : ' + props.subscribers + '</b><br />' +  '<b>' + 'IMSI : ' + props.imsi + '</b><br />'
          : 'Hover over a municipality</div>');
      };

      this.info.addTo(this.map);

      var highlightFeature = (e: any) => {
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
      // method that we will use to update the control based on feature properties passed        
      this._httpClient.get("../assets/data/municipalities.geojson").subscribe((response: any) => {
        response.features = response.features.filter((e: any) => {
          return e.properties.state_code == stateCode;
        });
        response.features.forEach((element: any) => {
          element.properties["imsi"] = this.getRandomInt();
          element.properties["subscribers"] = this.getRandomInt();
        });
        var converted = <geoJson.GeoJsonObject>response;
        this.geojson = L.geoJSON(converted, {
          style: (feature: any) => {
            return {
              fillColor: this.getColor(feature.properties.subscribers),
              weight: 1,
              opacity: 1,
              color: 'white',
              dashArray: '0',
              fillOpacity: 1,
            };
          },
          onEachFeature: (feature, layer) => {
            layer.on({
              // mouseover: highlightFeature,
              // mouseout: resetHighlight,
              click: () => {
                this.zoomToFeature(feature)
              }
            });
          }
        }).addTo(this.map);        
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
  }

  private zoomToFeature(e: any) {
   
   this.router.navigate(['table', e.properties.mun_code, e.properties.mun_name, ])
    //console.log(e.properties.mun_name);
  }
  private getRandomInt() {
    let min = Math.ceil(10);
    let max = Math.floor(1000);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private loadMap(): void {
    this.map = L.map('stateMap', {zoomControl: false}).setView([28.8, -107], 7);
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

    // var marker = L.marker([19.44,-99.09]).addTo(this.map);
    // marker.bindPopup("<b>Number of subscribers</b>: 20<br><b>IMSI</b> :3.3409E+14").openPopup();
  }

  getColor(d: number) {
    return d > 1000
      ? '#C70039'
      : d > 500
        ? '#C70039'
        : d > 200
          ? '#FF5733'
          : d > 100
            ? '#FFBF00'
            : d > 50
              ? '#FDDA0D'
              : d > 20
                ? '#FDDA0D'
                : d > 10
                  ? '#FBEC5D'
                  : '#FBEC5D';
  }
}
