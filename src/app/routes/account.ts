import { Component, OnInit } from "@angular/core";
import { TokenApiService } from "../services/tokenapi.service";
import { LocalStorageService } from "angular-2-local-storage";
import { Router } from "@angular/router";
import { AppService } from "../services/app.service";
import * as moment from 'moment';
import { ToastrService } from "ngx-toastr";

@Component({
    selector: 'account',
    templateUrl: 'account.html'
})
export class AccountComponent implements OnInit {

    uuid: string;
    tokens = [];
    columns = ['created', 'type', 'amount'];

    constructor(
        private localStorage: LocalStorageService,
        private tokenApiService: TokenApiService,
        private appService: AppService,
        private router: Router,
        public toast: ToastrService
    ) {
    }

    ngOnInit(): void {
        let apikey = this.localStorage.get("DN-API-KEY");
        this.uuid = this.localStorage.get('device-uuid');
        if (!apikey) {
            // not set up for demo:
            this.router.navigate(['/setup']);
        } else if (!this.uuid) {
            // not registered yet
            this.router.navigate(['/register']);
        } else {
            this.refresh();
        }
    }

    selectRow(row) {
        this.appService.currentToken = row;
        this.router.navigate(['/token']);
    }

    refresh() {
        this.tokenApiService.getTokens().then(res => this.tokens = res).catch(err => {
            this.toast.error(err, null, {timeOut: 5000, positionClass: 'toast-bottom-center'});
        });
    }

    formatDate(token: any): string {
        return moment(Date.parse(token.created)).format("MM/DD HH:mm");
    }

    formatAmount(token: any): string {
        if (token.type == 'CASHOUT')
            return token.amount/100 + " " + token.symbol;
        else
            return "";
    }

    createCashOut() {
        this.router.navigate(['/amount']);
    }

    createCashIn() {
        this.tokenApiService.createToken({
            amount: 100,
            symbol: 'EUR',
            type: 'CASHIN',
            device_uuid: this.localStorage.get("device-uuid")
        }).then(res => {
            this.appService.currentToken = res;
            this.router.navigate(['token']);
        }).catch(err => {
            this.toast.error(err, null, {timeOut: 5000, positionClass: 'toast-bottom-center'} );
        });
    }
}
  