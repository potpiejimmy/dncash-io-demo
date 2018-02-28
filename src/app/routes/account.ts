import { Component, OnInit } from "@angular/core";
import { TokenApiService } from "../services/tokenapi.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { LocalStorageService } from "angular-2-local-storage";
import { Router } from "@angular/router";

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
        console.log(row);
        this.tokenApiService.deleteToken(row.id).then(() => this.refresh());
    }

    refresh() {
        this.tokenApiService.getTokens().then(res => this.tokens = res);
    }

    createToken(type: string) {
        this.tokenApiService.createToken(type).then(res => {
            console.log(res);
            this.refresh();
        });
    }
}
  