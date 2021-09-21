import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums";
import * as httpModule from "tns-core-modules/http";

let clientData;

export default function getLocation(context) {
    clientData = context.evaluateTargetPathForAPI('#Page:Main').getClientData();
    var logger = context.getLogger();
    if (!geolocation.isEnabled()) {
        // request for the user to enable it
        geolocation.enableLocationRequest();
    }
    // Get current location with high accuracy
    return geolocation.getCurrentLocation({
        desiredAccuracy: Accuracy.high, //This will return the finest location available
        timeout: 15000 //How long to wait for a location in ms.
    }).then(function (loc) {
        clientData.lat      = loc.latitude;
        clientData.lon      = loc.longitude;
        clientData.qrcode   = JSON.stringify(loc);
        var url = "https://us1.locationiq.com/v1/reverse.php?key=" +
        "YOUR_API_KEY" + //**** Your API Key from LocationIQ ***
        "&lat=" + clientData.lat + "&lon=" + clientData.lon +
        "&format=json";        
        try {
        return httpModule.getString(url).then((r) => {
            const obj = JSON.parse(r);
            var place;
            if (obj.address.road){
                place = obj.address.road;
            } else if (obj.address.residential) {
                place = obj.address.residential;
            } else {
                place = obj.address.county;
            }
            var locMessage =
                "Where: " + place + '\n' +
                "City: " + obj.address.town + '\n' +
                "State: " + obj.address.state + '\n' +
                "Country: " + obj.address.country;
            return locMessage;
        }, (e) => {
            alert(e);
        });
    } catch (error) {
        return error.message;
    }
    }, function (e) {
        logger.log(e.message, 'ERROR');
    });
}
