import { Injectable } from "@angular/core";
import { AuthHttp } from "./authhttp.service";

import { environment } from "../../environments/environment";
import { LocalStorageService } from "angular-2-local-storage";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class TokenApiService extends AuthHttp {

    constructor(
        private httpClient: HttpClient,
        private localStorage: LocalStorageService) {
        super(httpClient, localStorage);
    }

    registerDevice(): Promise<any> {
        return this.post(environment.apiUrl+"devices", {pubkey: this.localStorage.get("keypair")['public']});
    }
}
