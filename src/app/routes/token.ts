import { Component, OnInit, ViewChild, NgZone, OnDestroy } from "@angular/core";
import { AppService } from "../services/app.service";
import { Router } from "@angular/router";
import { TokenApiService } from "../services/tokenapi.service";
import * as crypto from "crypto-browserify";
import { LocalStorageService } from "angular-2-local-storage";
import { Buffer } from "buffer";
import { QrScannerComponent } from "angular2-qrscanner";
import { MobileApiService } from "../services/mobileapi.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "../../environments/environment";
import * as moment from 'moment';

@Component({
    selector: 'token',
    templateUrl: 'token.html'
})
export class TokenComponent implements OnInit, OnDestroy {

    qrScannerComponent: QrScannerComponent;
    qrCanvasWidth: number;
    qrCanvasHeight: number;

    decryptedToken: Buffer;
    decrypting: boolean = true;
    scanning: boolean;
    ean: boolean;

    expirationString: string;
    updateExpirationTimeout: any;

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
    ) {
        this.qrCanvasWidth = environment.production ? 240 : 320;
        this.qrCanvasHeight = environment.production ? 320 : 240;
    }

    ngOnInit(): void {
        if (!this.appService.currentToken) this.finish();
        console.log(this.appService.currentToken);
        setTimeout(() => this.decryptToken(), 500);
        this.buildExpirationString();
    }

    ngOnDestroy(): void {
        clearTimeout(this.updateExpirationTimeout);
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
            this.decryptedToken = crypto.privateDecrypt({
                key: this.localStorageService.get("keypair")['private'],
                padding: 1 // constants.RSA_PKCS1_PADDING
            }, buf);
        } catch (err) {
            console.log(err);
        }
        this.ean = this.token().plain_code;
        this.decrypting = false;
    }

    qrCodeData(): string {
        if (!this.decryptedToken) return null;
        return this.token().uuid + this.decryptedToken.toString('hex');
    }

    qrCodeDataInfo(): string {
        if (this.decrypting) return "Decrypting...";
        if (!this.decryptedToken) return "Sorry, could not decrypt the token";
        return this.qrCodeData();
    }

    eanCodeData(): string {
        return this.token().plain_code + this.decryptedToken.toString();
    }

    buildExpirationString(): void {
        let t = this.token();
        if (!t.expires) return;
        let d = new Date(t.expires);
        if (d.getTime() <= Date.now()) this.expirationString = "Expired";
        else this.expirationString = "Expires " + moment(d).fromNow();
        this.updateExpirationTimeout = setTimeout(()=>this.buildExpirationString(), 10000);
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
