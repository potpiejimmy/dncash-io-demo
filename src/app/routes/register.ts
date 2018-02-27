import { Component, OnInit } from "@angular/core";
import * as keypair from 'keypair';
import { LocalStorageService } from "angular-2-local-storage";
import { TokenApiService } from "../services/tokenapi.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
    selector: 'register',
    templateUrl: 'register.html'
})
export class RegisterComponent {

    processing: boolean;
    pair: any;
    apikey: string;
    apisecret: string;
    userform: FormGroup;

    constructor(
        private localStorageService: LocalStorageService,
        private tokenApiService: TokenApiService,
        public snackBar: MatSnackBar,
        private router: Router,
        private fb: FormBuilder,
    ) {
        this.userform = this.fb.group({
            'inpapikey': new FormControl('', [Validators.required]),
            'inpapisecret': new FormControl('', [Validators.required])
        });
    }

    register() {
        this.processing = true;
        setTimeout(() => this.registerDevice(), 200);
    }

    registerDevice() {
        this.pair = keypair({bits: 2048});
        console.log(JSON.stringify(this.pair));
        this.localStorageService.set("DN-API-KEY", this.apikey);
        this.localStorageService.set("DN-API-SECRET", this.apisecret);
        this.localStorageService.set("keypair", this.pair);

        this.tokenApiService.registerDevice().then(res => {
            console.log("Registration Result: " + JSON.stringify(res));
            this.localStorageService.set('device-uuid', res.uuid);
            this.finish();
        }).catch(err => {
            console.log("Registration failed: " + err);
            this.pair = null;
            this.processing = false;
            this.snackBar.open(err, null, {duration: 3000, verticalPosition: 'top'});
        });
    }

    finish() {
        this.router.navigate(['/']);
    }
}
  