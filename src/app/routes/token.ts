import { Component, OnInit } from "@angular/core";
import { AppService } from "../services/app.service";
import { Router } from "@angular/router";
import { TokenApiService } from "../services/tokenapi.service";
import * as crypto from "crypto-browserify";
import { LocalStorageService } from "angular-2-local-storage";
import { Buffer } from "buffer";

@Component({
    selector: 'token',
    templateUrl: 'token.html'
})
export class TokenComponent implements OnInit {

    decryptedToken: string;

    constructor(
        private localStorageService: LocalStorageService,
        public appService: AppService,
        private tokenApiService: TokenApiService,
        private router: Router
    ) {}

    ngOnInit(): void {
        if (!this.appService.currentToken) this.finish();
        this.decryptToken();
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
            return t.amount + " " + t.symbol;
        } else {
            return "Cash In";
        }
    }

    token() {
        if (!this.appService.currentToken) return {};
        return this.appService.currentToken;
    }

    decryptToken(): void {
        try {
            let buf = new Buffer(this.token().secure_code, 'base64');
            let res = crypto.privateDecrypt(this.localStorageService.get("keypair")['private'], buf);
            this.decryptedToken = res.toString('hex');
        } catch (err) {
            console.log(err);
        }
    }

    qrCodeData(): string {
        if (!this.decryptedToken) return null;
        return this.token().uuid + this.decryptedToken;
    }

    qrCodeDataInfo(): string {
        if (!this.decryptedToken) return "Sorry, could not decrypt the token";
        return this.qrCodeData();
    }

    finish() {
        this.router.navigate(['/']);
    }
}
