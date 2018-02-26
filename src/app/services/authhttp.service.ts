import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { LocalStorageService } from 'angular-2-local-storage';

@Injectable()
export class AuthHttp {
    constructor (
        private http: HttpClient,
        private localStorageService: LocalStorageService) {
    }

    requestOptions() {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('DN-API-KEY', this.localStorageService.get("DN-API-KEY"));
        headers = headers.append('DN-API-SECRET', this.localStorageService.get("DN-API-SECRET"));
        return { headers: headers };
    }

    handleResponse(request: Observable<Object>): Promise<any> {
        return request.toPromise()
               .catch(err => this.handleError(err, this));
    }

    getBlob(url): Promise<any>  {
        let options = this.requestOptions();
        options["responseType"] = "blob";
        return this.handleResponse(this.http.get(url, options));
    }

    get(url): Promise<any>  {
        return this.handleResponse(this.http.get(url, this.requestOptions()));
    }

    post(url, data): Promise<any>  {
        return this.handleResponse(this.http.post(url, data, this.requestOptions()));
    }

    put(url, data): Promise<any>  {
        return this.handleResponse(this.http.put(url, data, this.requestOptions()));
    }

    delete(url): Promise<any>  {
        return this.handleResponse(this.http.delete(url, this.requestOptions()));
    }

    private handleError(error: any, me: AuthHttp): Promise<any> {
        console.error('An error occurred', JSON.stringify(error)); // XXX for debugging purposes
        if (!error.status) error.message = "Sorry, " + environment.apiUrl + " cannot be reached.";
        return Promise.reject(error.error.message || error.message || error);
    }
}
