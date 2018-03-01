import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';

// Material:
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

// Externals
import { LocalStorageModule } from 'angular-2-local-storage';
import { NgxQRCodeModule } from 'ngx-qrcode2';

import { AppComponent } from './app.component';
import { AuthHttp } from './services/authhttp.service';
import { TokenApiService } from './services/tokenapi.service';
import { AccountComponent } from './routes/account';
import { AppRoutes } from './app.routes';
import { RegisterComponent } from './routes/register';
import { AppMainComponent } from './app.main';
import { AppService } from './services/app.service';
import { TokenComponent } from './routes/token';
import { DemoSetupComponent } from './routes/demosetup';


@NgModule({
  declarations: [
    AppComponent,
    AppMainComponent,
    RegisterComponent,
    AccountComponent,
    TokenComponent,
    DemoSetupComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    // Material:
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    // Externals:
    NgxQRCodeModule,
    LocalStorageModule.withConfig({ prefix: 'dncashio-demo', storageType: 'localStorage' }), // or sessionStorage
    // App:
    AppRoutes
  ],
  providers: [
    AppService,
    AuthHttp,
    TokenApiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
