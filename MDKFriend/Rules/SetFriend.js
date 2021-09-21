export default function SetFriend(context) {
    let clientData = context.evaluateTargetPathForAPI('#Page:Main').getClientData();
    return clientData.FriendJSON;
}
