import { Component, OnInit } from "@angular/core";
import { AppService } from "../services/app.service";
import { Router } from "@angular/router";
import { TokenApiService } from "../services/tokenapi.service";

@Component({
    selector: 'token',
    templateUrl: 'token.html'
})
export class TokenComponent implements OnInit {
    constructor(
        public appService: AppService,
        private tokenApiService: TokenApiService,
        private router: Router
    ) {}

    ngOnInit(): void {
        if (!this.appService.currentToken) this.finish();
    }

    delete() {
        this.tokenApiService.deleteToken(this.appService.currentToken.uuid).then(() => {
            this.appService.currentToken = null;
            this.finish();
        });
    }

    finish() {
        this.router.navigate(['/']);
    }
}
