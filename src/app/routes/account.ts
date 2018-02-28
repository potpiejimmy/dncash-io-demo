import { Component, OnInit } from "@angular/core";
import { TokenApiService } from "../services/tokenapi.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { LocalStorageService } from "angular-2-local-storage";
import { Router } from "@angular/router";
import { AppService } from "../services/app.service";

@Component({
    selector: 'account',
    templateUrl: 'account.html'
})
export class AccountComponent implements OnInit {

    uuid: string;
    tokens = [];
    columns = ['id', 'type', 'amount'];

    constructor(
        private localStorageService: LocalStorageService,
        private tokenApiService: TokenApiService,
        private appService: AppService,
        private router: Router,
        public snackBar: MatSnackBar
    ) {
    }

    ngOnInit(): void {
        this.uuid = this.localStorageService.get('device-uuid');
        if (!this.uuid) {
            // not registered yet
            this.router.navigate(['/register']);
        } else {
            this.refresh();
        }
    }

    selectRow(row) {
        this.appService.currentToken = row;
        //this.tokenApiService.deleteToken(row.uuid).then(() => this.refresh());
        this.router.navigate(['/token']);
    }

    refresh() {
        this.tokenApiService.getTokens().then(res => this.tokens = res);
    }

    createToken(type: string) {
        this.tokenApiService.createToken(type).then(res => {
            console.log(res);
            this.refresh();
        }).catch(err => {
            this.snackBar.open(err, null, {duration: 5000, verticalPosition: 'top'});
        });
    }
}
  