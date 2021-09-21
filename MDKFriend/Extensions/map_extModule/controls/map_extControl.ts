import * as app from '@nativescript/core/application';
import { IControl } from 'mdk-core/controls/IControl';
import { BaseObservable } from 'mdk-core/observables/BaseObservable';
import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums";

export class map_extClass extends IControl {

    private _observable: BaseObservable;
    private _context: any;
    private _mapView: any;
    private _Friend: any;
    private _gMap: any;
    private _valor: any;
    private _marker: any;

    public initialize(props) {
        super.initialize(props);
        // Extension Properties
        let extProps = this.definition().data.ExtensionProperties;
        if (extProps) {
            // Resolve SalesData
            this.valueResolver().resolveValue(extProps.Friend, this._mapView, true).then(function (Friend) {
                // alert(this._context);                
                // this._Friend = Friend;
                if (app.android) {
                    //You will display the Google Maps in a MapView.For more details on Google Maps API for android, visit
                    //https://developers.google.com/android/reference/com/google/android/gms/maps/package-summary

                    this._mapView = new com.google.android.gms.maps.MapView(this.androidContext());
                    var localeLanguage = java.util.Locale;

                    //GeoCoder is required to convert a location to get latitude and longitude
                    this._geo = new android.location.Geocoder(this.androidContext(), localeLanguage.ENGLISH);
                    this._mapView.onCreate(null);
                    this._mapView.onResume();

                    //when mapview control is used, all the lifecycle activities has to be frowaded to below methods.
                    app.android.on(app.AndroidApplication.activityPausedEvent, this.onActivityPaused, this);
                    app.android.on(app.AndroidApplication.activityResumedEvent, this.onActivityResumed, this);
                    app.android.on(app.AndroidApplication.saveActivityStateEvent, this.onActivitySaveInstanceState, this);
                    app.android.on(app.AndroidApplication.activityDestroyedEvent, this.onActivityDestroyed, this);
                    var that = this;
                    //A GoogleMap must be acquired using getMapAsync(OnMapReadyCallback).
                    //The MapView automatically initializes the maps system and the view
                    var mapReadyCallBack = new com.google.android.gms.maps.OnMapReadyCallback({
                        onMapReady: (gMap) => {
                            //Map 
                            that._gMap = gMap;
                            var zoomValue = 12.0;
                            that._gMap.setMinZoomPreference = zoomValue;
                            that._gMap.setMapType(4);
                            that._gMap.setMyLocationEnabled(true);
                            if (!geolocation.isEnabled()) {
                                // request for the user to enable it
                                geolocation.enableLocationRequest();
                            }
                            //Friend is here...
                            var flatlon = new com.google.android.gms.maps.model.LatLng(Friend.latitude, Friend.longitude);
                            var fmarker = new com.google.android.gms.maps.model.MarkerOptions().position(flatlon).title("Your friend is here!");
                            this._marker = that._gMap.addMarker(fmarker);                            
                            console.log("inside onMapReady function");
                            try {
                                var id = geolocation.watchLocation(
                                    (loc) => {
                                        if (loc) {
                                            var latlon = new com.google.android.gms.maps.model.LatLng(loc.latitude, loc.longitude);
                                            this._gMap.moveCamera(new com.google.android.gms.maps.CameraUpdateFactory.newLatLng(latlon));
                                        }
                                    },
                                    (e) => {
                                        console.log(e);
                                        dialogs.alert(e.message);
                                    },
                                    {
                                        // updateDistance: 1, // 1 meters
                                        updateTime: 500,
                                        minimumUpdateTime: 500, //
                                        desiredAccuracy: Accuracy.high,
                                    }
                                );
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    });
                    this._mapView.getMapAsync(mapReadyCallBack);
                }

                if (app.ios) {

                    if (Friend) {
                        var flatlong = CLLocationCoordinate2DMake(Friend.latitude, Friend.longitude);
                        var fannotation = MKPointAnnotation.alloc().init();
                        fannotation.title = "Your friend is here!";
                        fannotation.coordinate = flatlong;
                        this._mapView.centerCoordinate = flatlong;
                        this._mapView.addAnnotation(fannotation);
                    }
                    try {
                        var id = geolocation.watchLocation(
                            (loc) => {
                                if (loc) {
                                    //Just adding points to the map...
                                    try {
                                        var latlong = CLLocationCoordinate2DMake(loc.latitude, loc.longitude);
                                        var annotation = MKPointAnnotation.alloc().init();
                                        var acc = parseFloat(loc.horizontalAccuracy).toFixed(2);
                                        loc.speed = loc.speed * 3.6;
                                        var speed = parseFloat(loc.speed).toFixed(2);
                                        annotation.title = "You are here!" + '\n' + "Speed: " + speed + "km/h Accuracy: " + acc + "/m";
                                        annotation.coordinate = latlong;
                                        this._mapView.centerCoordinate = latlong;
                                        this._mapView.addAnnotation(annotation);
                                        if (this._marker) {
                                            this._mapView.removeAnnotation(this._marker);
                                            this._marker = annotation;
                                        } else {
                                            this._marker = annotation;
                                        }
                                    } catch (error) {
                                        alert(error);
                                    }
                                }
                            },
                            (e) => {
                                alert(e);
                                dialogs.alert(e.message);
                            },
                            {
                                updateDistance: 1, // 1 meters
                                minimumUpdateTime: 1000, // update every 1 seconds
                                desiredAccuracy: Accuracy.high,
                            }
                        );
                    } catch (error) {
                        alert(error);
                    }
                }

            }.bind(this));
        }
    }

    private onActivityPaused(args) {
        console.log("onActivityPaused()");
        if (!this._mapView || this != args.activity) return;
        this._mapView.onPause();
    }

    private onActivityResumed(args) {
        console.log("onActivityResumed()");
        if (!this._mapView || this != args.activity) return;
        this._mapView.onResume();
    }

    private onActivitySaveInstanceState(args) {
        console.log("onActivitySaveInstanceState()");
        if (!this._mapView || this != args.activity) return;
        this._mapView.onSaveInstanceState(args.bundle);
    }

    private onActivityDestroyed(args) {
        console.log("onActivityDestroyed()");
        if (!this._mapView || this != args.activity) return;
        this._mapView.onDestroy();
    }

    public view() {

        if (app.android) {
            return this._mapView;
        }
        if (app.ios) {
            this._mapView = MKMapView.alloc().initWithFrame(CGRectMake(0, 0, 1000, 1000));
            this._mapView.mapType = MKMapTypeSatellite;
            return this._mapView;
        }
    }

    public viewIsNative() {
        return true;
    }

    // Abstract Method
    public observable() {
        if (!this._observable) {
            this._observable = new BaseObservable(this, this.definition(), this.page());
        }
        return this._observable;

    }

    // Abstract Method
    public setValue(value: any, notify: boolean): Promise<any> {
        return Promise.resolve();
    }

    public setContainer(container: IControl) {
        // do nothing
    }
}