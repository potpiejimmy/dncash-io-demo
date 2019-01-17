import { Injectable } from "@angular/core";
import { AuthHttp } from "./authhttp.service";

import { environment } from "../../environments/environment";
import { LocalStorageService } from "angular-2-local-storage";
import { HttpClient } from "@angular/common/http";

import { Observer ,  Observable } from "rxjs";
import { Buffer } from "buffer";

@Injectable()
export class TokenApiService extends AuthHttp {

    socket: WebSocket;
    observer: Observer<any>;

    constructor(
        private httpClient: HttpClient,
        private localStorage: LocalStorageService) {
        super(httpClient, localStorage);
    }

    registerDevice(): Promise<any> {
        return this.post(environment.apiUrl+"devices", {
            pubkey: this.localStorage.get("keypair")['public'],
            refname: navigator.userAgent.substr(0,36)
        });
    }

    createToken(token: any): Promise<any> {
        return this.post(environment.apiUrl+"tokens", token);
    }

    getTokens(): Promise<any> {
        return this.get(environment.apiUrl+"tokens?device_uuid="+this.localStorage.get("device-uuid"));
    }

    getToken(uid: string): Promise<any> {
        return this.get(environment.apiUrl+"tokens/"+uid);
    }

    deleteToken(uid: number): Promise<any> {
        return this.delete(environment.apiUrl+"tokens/"+uid+"?device_uuid="+this.localStorage.get("device-uuid"));
    }

    subscribeChanges(): Observable<any> {
        if (!this.socket) {
            this.socket = new WebSocket(environment.apiUrlWs+"tokenchange/"+this.localStorage.get("DN-API-KEY"));
            this.socket.onmessage = data => this.getToken(JSON.parse(data.data).uuid).then(t => {
                if (this.localStorage.get("device-uuid") == t.device_uuid) this.observer.next(t);
            });
            this.socket.onclose = () => this.observer.error("closed");
            this.socket.onerror = err => this.observer.error(err);
        }
        return new Observable(observer => this.observer = observer);
    }

    unsubscribeChanges(): void {
        this.observer.complete();
        this.socket.close();
        this.socket = null;
    }
}
