import { Component } from "@angular/core";
import * as keypair from 'keypair';
import { LocalStorageService } from "angular-2-local-storage";
import { TokenApiService } from "../services/tokenapi.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: 'app-main',
    templateUrl: 'main.html'
})
export class MainComponent {

    processing: boolean;
    pair: any;
    apikey: string;
    apisecret: string;

    constructor(
        private localStorageService: LocalStorageService,
        private tokenApiService: TokenApiService,
        public snackBar: MatSnackBar
    ) {
    }

    register() {
        this.processing = true;
        setTimeout(() => this.registerDevice(), 200);
    }

    registerDevice() {
        this.pair = keypair({bits: 1024});
        console.log(JSON.stringify(this.pair));
        this.localStorageService.set("DN-API-KEY", this.apikey);
        this.localStorageService.set("DN-API-SECRET", this.apisecret);
        this.localStorageService.set("keypair", this.pair);

        this.tokenApiService.registerDevice().then(res => {
            console.log("Registration Result: " + JSON.stringify(res));
        }).catch(err => {
            console.log("Registration failed: " + err);
            this.pair = null;
            this.processing = false;
            this.snackBar.open(err, null, {duration: 3000, verticalPosition: 'top'});
        });
    }
}
  