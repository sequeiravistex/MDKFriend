export default function BarcodeScanResult(context) {
    var actionResult = context.getActionResult('BarcodeScanner');
    var scannedResult = actionResult.data;
    let clientData = context.evaluateTargetPathForAPI('#Page:Main').getClientData();
    var json = JSON.parse(scannedResult);
    clientData.FriendLat    = json.latitude;
    clientData.FriendLon    = json.longitude;
    clientData.FriendJSON   = json;
    return context.executeAction('/MDKFriend/Actions/OpenFriend.action');
}