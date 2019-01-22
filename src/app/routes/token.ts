import { Component, OnInit, ViewChild, NgZone, OnDestroy } from "@angular/core";
import { AppService } from "../services/app.service";
import { Router, ActivatedRoute } from "@angular/router";
import { TokenApiService } from "../services/tokenapi.service";
import * as crypto from "crypto-browserify";
import { LocalStorageService } from "angular-2-local-storage";
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { Buffer } from "buffer";
import { MobileApiService } from "../services/mobileapi.service";
import { environment } from "../../environments/environment";
import { ToastrService } from "ngx-toastr";
import * as moment from 'moment';

@Component({
    selector: 'token',
    templateUrl: 'token.html'
})
export class TokenComponent implements OnInit, OnDestroy {

    scanner: ZXingScannerComponent;

    hasDevices: boolean;
    hasPermission: boolean;

    availableDevices: MediaDeviceInfo[];
    currentDevice: MediaDeviceInfo;

    decryptedToken: Buffer;
    decrypting: boolean = true;
    scanning: boolean;
    ean: boolean;

    expirationString: string;
    updateExpirationTimeout: any;

    triggercodeQueryParam: string;

    @ViewChild(ZXingScannerComponent) set scannerComponent(scannerComponent: ZXingScannerComponent) {
        if (scannerComponent) {
            this.scanner = scannerComponent;
            this.setupCamera();
       }
    } 
    
    constructor(
        private localStorageService: LocalStorageService,
        public appService: AppService,
        private tokenApiService: TokenApiService,
        private mobileApiService: MobileApiService,
        private router: Router,
        private route: ActivatedRoute,
        public toast: ToastrService
    ) {
    }

    ngOnInit(): void {
        // fetch triggercode if passed via query param
        this.route.queryParams.subscribe(params => this.triggercodeQueryParam = params.triggercode);
        if (!this.appService.currentToken) {
            // no token set from main UI, try to load the first available token if this route is directly invoked
            this.tokenApiService.getTokens().then(res => {
                this.appService.currentToken = res[0];
                this.initializeToken();
            });
        } else {
            this.initializeToken();
        }
    }

    ngOnDestroy(): void {
        clearTimeout(this.updateExpirationTimeout);
    }

    initializeToken(): void {
        if (!this.appService.currentToken) this.finish();
        console.log(this.appService.currentToken);
        setTimeout(() => this.decryptToken(), 200);
        this.buildExpirationString();
    }
    
    setupCamera(): void {
        this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
            this.hasDevices = true;
            this.availableDevices = devices;
            if (devices.length > 0){
                this.currentDevice = devices[0];
                for (const device of devices){
                    console.log(device);
                    if(!device.label.toUpperCase().includes("FR")) this.currentDevice = device;
                }
                this.scanner.changeDevice(this.currentDevice);
            }
        });
        this.scanner.camerasNotFound.subscribe(() => this.hasDevices = false);
        this.scanner.permissionResponse.subscribe((perm: boolean) => this.hasPermission = perm);
    }

    onDeviceSelectChange(selectedValue: string) {
        this.currentDevice = this.scanner.getDeviceById(selectedValue);
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
        // trigger code already available (passed in as param?)
        if (this.triggercodeQueryParam) this.qrCodeScanned(this.triggercodeQueryParam);
    }

    qrCodeData(): string {
        if (!this.decryptedToken) return null;
        return this.token().uuid + this.decryptedToken.toString('hex');
    }

    qrCodeDataInfo(): string {
        if (this.decrypting) return "";
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

    qrCodeScanned(triggercode: string) {
        if (!this.scanning && !this.triggercodeQueryParam) return;
        this.scanning = false
        let triggerCodeParam = "triggercode=";
        let triggerCodeParamIx = triggercode.indexOf(triggerCodeParam);
        if (triggerCodeParamIx>=0) {
            triggercode = triggercode.substr(triggerCodeParamIx + triggerCodeParam.length);
        }
        console.log(triggercode);
        let radiocode = this.qrCodeData();
        // create signature for triggercode+radiocode
        let sign = crypto.createSign("RSA-SHA256");
        sign.write(triggercode+radiocode);
        let signature = sign.sign(this.localStorageService.get("keypair")['private']).toString('base64');
        this.mobileApiService.sendTrigger(triggercode, radiocode, signature).then(() => {
            this.finish();
        }).catch(err => {
            console.log(err);
            this.toast.warning("Invalid trigger code.", null, {timeOut: 5000, positionClass: 'toast-bottom-center'});
        });
    }

    finish() {
        this.router.navigate(['/'], { replaceUrl: true });
    }
}
