import { Injectable } from "@angular/core";
import { AuthHttp } from "./authhttp.service";
import { environment } from "../../environments/environment";

@Injectable()
export class MobileApiService extends AuthHttp {
    
    sendTrigger(triggercode: string, radiocode: string, signature: string): Promise<any> {
        return this.post(environment.mobileApiUrl+"trigger", {
            triggercode: triggercode,
            radiocode: radiocode,
            signature: signature
        })
    }
}
