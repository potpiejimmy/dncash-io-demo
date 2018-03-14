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

    denoms;

    amount: number = 0;
    symbol: string = 'EUR';

    processing: boolean;

    constructor(
        public appService: AppService,
        private tokenApiService: TokenApiService,
        private localStorage: LocalStorageService,
        private router: Router,
        public snackBar: MatSnackBar
    ) {        
    }

    ngOnInit(): void {
        this.denoms = [this.sel10, this.sel20, this.sel50, this.sel100];
    }

    update(): void {
        this.amount = 0;
        this.denoms.forEach(i => this.amount += i.amount());
    }

    valid(): boolean {
        return this.amount > 0;
    }

    denomData(): Array<any> {
        let data = [];
        this.denoms.forEach(i => data.push(i.denomData()));
        return data;
    }

    finish() {
        this.processing = true;
        this.tokenApiService.createToken({
            amount: this.amount,
            symbol: this.symbol,
            type: 'CASHOUT',
            device_uuid: this.localStorage.get("device-uuid"),
            expires: Date.now() + 300000, // expires in 5 minutes
            info: {
                denomData: this.denomData()
            }
        }).then(res => {
            this.appService.currentToken = res;
            this.router.navigate(['token'], { replaceUrl: true });
        }).catch(err => {
            this.processing = false;
            this.snackBar.open(err, null, {duration: 5000, verticalPosition: 'top'});
        });
    }
}

