import { ImageSource } from "tns-core-modules/image-source";
import { QrGenerator } from "nativescript-qr-generator";

/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function GenerateQRCode(context) {
		let clientData = context.evaluateTargetPathForAPI('#Page:Main').getClientData();
		let text = clientData.qrcode;
		const result = new QrGenerator().generate(text);
		return new ImageSource(result);
}