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

    createToken(type: string): Promise<any> {
        return this.post(environment.apiUrl+"tokens", {
            amount: 50,
            symbol: 'EUR',
            type: type,
            device_uuid: this.localStorage.get("device-uuid")
        });
    }

    getTokens(): Promise<any> {
        return this.get(environment.apiUrl+"tokens?device_uuid="+this.localStorage.get("device-uuid"));
    }

    deleteToken(id: number): Promise<any> {
        return this.delete(environment.apiUrl+"tokens/"+id+"?device_uuid="+this.localStorage.get("device-uuid"));
    }
}
