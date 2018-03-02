import { Component, OnInit, ViewChild } from "@angular/core";
import { DenomSelComponent } from "../components/denomsel";
import { AppService } from "../services/app.service";
import { TokenApiService } from "../services/tokenapi.service";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { LocalStorageService } from "angular-2-local-storage";

@Component({
    selector: 'amount',
    templateUrl: 'amount.html'
})
export class AmountComponent implements OnInit {

    @ViewChild("sel10")  sel10:  DenomSelComponent
    @ViewChild("sel20")  sel20:  DenomSelComponent
    @ViewChild("sel50")  sel50:  DenomSelComponent
    @ViewChild("sel100") sel100: DenomSelComponent

    amount: number = 0;
    symbol: string = 'EUR';

    constructor(
        public appService: AppService,
        private tokenApiService: TokenApiService,
        private localStorage: LocalStorageService,
        private router: Router,
        public snackBar: MatSnackBar
    ) {        
    }

    ngOnInit(): void {
    }

    update(): void {
        this.amount = 
            this.sel10.amount() +
            this.sel20.amount() +
            this.sel50.amount() +
            this.sel100.amount();
    }

    valid(): boolean {
        return this.amount > 0;
    }

    finish() {
        this.tokenApiService.createToken({
            amount: this.amount,
            symbol: this.symbol,
            type: 'CASHOUT',
            device_uuid: this.localStorage.get("device-uuid")
        }).then(res => {
            console.log(res);
            this.appService.currentToken = res;
            this.router.navigate(['token']);
        }).catch(err => {
            this.snackBar.open(err, null, {duration: 5000, verticalPosition: 'top'});
        });
    }
}

