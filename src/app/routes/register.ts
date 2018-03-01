import { Component, OnInit } from "@angular/core";
import * as keypair from 'keypair';
import { LocalStorageService } from "angular-2-local-storage";
import { TokenApiService } from "../services/tokenapi.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

@Component({
    selector: 'register',
    templateUrl: 'register.html'
})
export class RegisterComponent {

    processing: boolean;
    pair: any;

    constructor(
        private localStorageService: LocalStorageService,
        private tokenApiService: TokenApiService,
        public snackBar: MatSnackBar,
        private router: Router
    ) {
    }

    register() {
        this.processing = true;
        setTimeout(() => this.registerDevice(), 1000);
    }

    registerDevice() {
        this.pair = keypair({bits: 2048});
        console.log(JSON.stringify(this.pair));
        this.localStorageService.set("keypair", this.pair);

        this.tokenApiService.registerDevice().then(res => {
            console.log("Registration Result: " + JSON.stringify(res));
            this.localStorageService.set('device-uuid', res.uuid);
            this.finish();
        }).catch(err => {
            console.log("Registration failed: " + err);
            this.pair = null;
            this.processing = false;
            this.snackBar.open(err, null, {duration: 5000, verticalPosition: 'top'});
        });
    }

    finish() {
        this.router.navigate(['/']);
    }
}
  