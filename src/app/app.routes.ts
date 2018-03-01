import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { RegisterComponent }  from './routes/register';
import { AccountComponent } from './routes/account';
import { TokenComponent } from './routes/token';
import { DemoSetupComponent } from './routes/demosetup';

export const routes: Routes = [
    {path: '', component: AccountComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'token', component: TokenComponent},
    {path: 'setup', component: DemoSetupComponent}
];

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes);
