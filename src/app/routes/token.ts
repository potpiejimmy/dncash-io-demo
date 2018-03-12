import { Component, OnInit, ViewChild, NgZone } from "@angular/core";
import { AppService } from "../services/app.service";
import { Router } from "@angular/router";
import { TokenApiService } from "../services/tokenapi.service";
import * as crypto from "crypto-browserify";
import { LocalStorageService } from "angular-2-local-storage";
import { Buffer } from "buffer";
import { QrScannerComponent } from "angular2-qrscanner";
import { MobileApiService } from "../services/mobileapi.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: 'token',
    templateUrl: 'token.html'
})
export class TokenComponent implements OnInit {

    qrScannerComponent: QrScannerComponent;

    decryptedToken: string;
    decrypting: boolean = true;
    scanning: boolean;

    @ViewChild(QrScannerComponent) set scannerComponent(scannerComponent: QrScannerComponent) {
        if (scannerComponent) {
            this.qrScannerComponent = scannerComponent;
            this.setupCamera();
        }
    }

    constructor(
        private zone: NgZone,
        private localStorageService: LocalStorageService,
        public appService: AppService,
        private tokenApiService: TokenApiService,
        private mobileApiService: MobileApiService,
        private router: Router,
        public snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        if (!this.appService.currentToken) this.finish();
        console.log(this.appService.currentToken);
        setTimeout(() => this.decryptToken(), 500);
    }

    setupCamera(): void {
        this.qrScannerComponent.getMediaDevices().then(devices => {
            console.log(devices);
            const videoDevices: MediaDeviceInfo[] = [];
            for (const device of devices) {
                if (device.kind.toString() === 'videoinput') {
                    videoDevices.push(device);
                }
            }
            if (videoDevices.length > 0){
                let choosenDev = videoDevices[videoDevices.length-1];
                this.qrScannerComponent.chooseCamera.next(choosenDev);
            }
        });

        this.qrScannerComponent.capturedQr.subscribe(result => {
            this.zone.run(() => this.qrCodeScanned(result));
        });
    }

    delete() {
        this.tokenApiService.deleteToken(this.appService.currentToken.uuid).then(() => {
            this.appService.currentToken = null;
            this.finish();
        });
    }

    headerLabel() {
        let t = this.token();
        if (t.type == 'CASHOUT') {
            return t.amount/100 + " " + t.symbol;
        } else {
            return "Cash In";
        }
    }

    token() {
        if (!this.appService.currentToken) return {};
        return this.appService.currentToken;
    }

    decryptToken(): void {
        if (!this.appService.currentToken) return;
        try {
            let buf = new Buffer(this.token().secure_code, 'base64');
            let res = crypto.privateDecrypt({
                key: this.localStorageService.get("keypair")['private'],
                padding: 1 // constants.RSA_PKCS1_PADDING
            }, buf);
            this.decryptedToken = res.toString('hex');
        } catch (err) {
            console.log(err);
        }
        this.decrypting = false;
    }

    qrCodeData(): string {
        if (!this.decryptedToken) return null;
        return this.token().uuid + this.decryptedToken;
    }

    qrCodeDataInfo(): string {
        if (this.decrypting) return "Decrypting...";
        if (!this.decryptedToken) return "Sorry, could not decrypt the token";
        return this.qrCodeData();
    }

    scan() {
        this.scanning = true;
    }

    qrCodeScanned(result: string) {
        console.log(result);
        this.mobileApiService.sendTrigger(result, this.qrCodeData()).then(() => {
            this.finish();
        }).catch(err => {
            console.log(err);
            this.snackBar.open("Invalid trigger code.", null, {duration: 5000, verticalPosition: 'top'});
        });
    }

    finish() {
        this.router.navigate(['/'], { replaceUrl: true });
    }
}
