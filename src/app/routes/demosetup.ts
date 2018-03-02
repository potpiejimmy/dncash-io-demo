import { LocalStorageService } from "angular-2-local-storage";
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder, FormControl, Validators, FormGroup } from "@angular/forms";
import { Component, OnInit } from "@angular/core";

@Component({
    selector: 'demosetup',
    templateUrl: 'demosetup.html'
})
export class DemoSetupComponent implements OnInit {

    apikey: string;
    apisecret: string;
    userform: FormGroup;

    constructor(
        private localStorageService: LocalStorageService,
        private router: Router,
        private route: ActivatedRoute,
        private fb: FormBuilder,
    ) {
        this.userform = this.fb.group({
            'inpapikey': new FormControl('', [Validators.required]),
            'inpapisecret': new FormControl('', [Validators.required])
        });
    }

    ngOnInit() {
        // auto-setup if params passed:
        this.route.queryParams.subscribe(params => {
            if (params.key && params.secret) {
                this.apikey = params.key;
                this.apisecret = params.secret;
                this.setup();
            }
        })
    }

    setup() {
        let oldApiKey = this.localStorageService.get("DN-API-KEY");
        let oldApiSecret = this.localStorageService.get("DN-API-SECRET");
        let uuid = this.localStorageService.get('device-uuid');

        if (this.apikey != oldApiKey || this.apisecret != oldApiSecret) {
            // new api credentials, (re-)register device:
            this.localStorageService.set("DN-API-KEY", this.apikey);
            this.localStorageService.set("DN-API-SECRET", this.apisecret);
            this.finish('/register');
        } else {
            // credentials not changed, go to main if already registered:
            if (uuid) this.finish('/');
            else this.finish('/register');
        }
    }

    finish(target: string) {
        this.router.navigate([target], {replaceUrl:true});
    }
}
