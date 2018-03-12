import { Injectable } from "@angular/core";
import { AuthHttp } from "./authhttp.service";
import { environment } from "../../environments/environment";

@Injectable()
export class MobileApiService extends AuthHttp {
    
    sendTrigger(triggercode: string, radiocode: string): Promise<any> {
        return this.put(environment.mobileApiUrl+"trigger/"+triggercode, {
            radiocode: radiocode
        })
    }
}
