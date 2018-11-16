import { Component, OnInit, ViewChild } from "@angular/core";
import { TokenApiService } from "./services/tokenapi.service";
import { PushNotificationsService } from "ng-push";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

@Component({
    selector: 'app-main',
    templateUrl: 'app.main.html',
})
export class AppMainComponent implements OnInit {

    constructor(
        private tokenApiService: TokenApiService,
        private pushNotificationService: PushNotificationsService,
        private router: Router,
        public toast: ToastrService
    ) {}

    ngOnInit(): void {
        this.subscribeChanges();
    }

    ngOnDestroy(): void {
        this.tokenApiService.unsubscribeChanges();
    }

    subscribeChanges(): void {
        console.log("Connect websocket.");
        this.tokenApiService.subscribeChanges().subscribe(token => {
            if (token.state != 'OPEN') {
                // this.pushNotificationService.create('Testpush', {body: "Your transaction completed with status: " + token.state}).subscribe(
                //     res => console.log(res),
                //     err => console.log(err)
                // );
                this.router.navigate(['/'], { replaceUrl: true });
                switch (token.state) {
                    case 'LOCKED':
                    case 'CANCELED':
                        this.toast.info("Token state " + token.state, null, {timeOut: 2000, positionClass: 'toast-bottom-center'});
                        break;
                    case 'COMPLETED':
                        this.toast.success("Token state " + token.state, null, {timeOut: 4000, positionClass: 'toast-bottom-center'});
                        break;
                    default:
                    this.toast.error("Token update, status " + token.state, null, {timeOut: 4000, positionClass: 'toast-bottom-center'});
                }
                
            }
        }, err => {
            console.log("Websocket: " + err);
            this.tokenApiService.unsubscribeChanges();
            setTimeout(() => this.subscribeChanges(), 1000); // reconnect after 1 second
        });
    }
}
