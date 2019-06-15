import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';

import {
    AuthModule,
    OidcSecurityService,
    ConfigResult,
    OidcConfigService,
    OpenIdConfiguration
} from 'angular-auth-oidc-client';

import { AutoLoginComponent } from './auto-login/auto-login.component';
import { routing } from './app.routes';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { ProtectedComponent } from './protected/protected.component';
import { AuthorizationGuard } from './authorization.guard';
import { environment } from '../environments/environment';

export function loadConfig(oidcConfigService: OidcConfigService) {
  console.log('APP_INITIALIZER STARTING');
  // https://login.microsoftonline.com/damienbod.onmicrosoft.com/.well-known/openid-configuration
  // jwt keys: https://login.microsoftonline.com/common/discovery/keys
  // Azure AD does not support CORS, so you need to download the OIDC configuration, and use these from the application.
  // The jwt keys needs to be configured in the well-known-openid-configuration.json
  return () => oidcConfigService.load(`${window.location.origin}/api/config/configuration`);
  //return () => oidcConfigService.load_using_custom_stsServer('https://localhost:44347/well-known-openid-configuration.json');
}

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    AutoLoginComponent,
    ForbiddenComponent,
    UnauthorizedComponent,
    ProtectedComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    AuthModule.forRoot(),
    FormsModule,
    routing,
  ],
  providers: [
	  OidcSecurityService,
	  OidcConfigService,
	  {
		  provide: APP_INITIALIZER,
		  useFactory: loadConfig,
		  deps: [OidcConfigService],
		  multi: true
    },
    AuthorizationGuard
	],
  bootstrap: [AppComponent]
})

export class AppModule {

  constructor(
    private oidcSecurityService: OidcSecurityService,
    private oidcConfigService: OidcConfigService,
  ) {
    this.oidcConfigService.onConfigurationLoaded.subscribe((configResult: ConfigResult) => {

      const config: OpenIdConfiguration = {
        stsServer: 'https://login.microsoftonline.com/ed48a4e2-9762-4f41-8a15-9bcd99965fab/v2.0/',
        redirect_url: configResult.customConfig.redirect_url,
        client_id: configResult.customConfig.client_id,
        response_type: configResult.customConfig.response_type,
        scope: configResult.customConfig.scope,
        post_logout_redirect_uri: configResult.customConfig.post_logout_redirect_uri,
        start_checksession: configResult.customConfig.start_checksession,
        silent_renew: configResult.customConfig.silent_renew,
        silent_renew_url: 'https://localhost:44311/silent-renew.html',
        post_login_route: '/home',
        forbidden_route: configResult.customConfig.forbidden_route,
        unauthorized_route: configResult.customConfig.unauthorized_route,
        log_console_warning_active: configResult.customConfig.log_console_warning_active,
        log_console_debug_active: configResult.customConfig.log_console_debug_active,
        max_id_token_iat_offset_allowed_in_seconds: configResult.customConfig.max_id_token_iat_offset_allowed_in_seconds,
        history_cleanup_off: true,
        iss_validation_off: true
        // disable_iat_offset_validation: true
      };


      this.oidcSecurityService.setupModule(config, configResult.authWellknownEndpoints);

      this.oidcSecurityService.setCustomRequestParameters(configResult.customConfig.additional_login_parameters);
      this.oidcSecurityService.setCustomRequestParameters({ response_mode: 'fragment' } );
    });

    //this.oidcConfigService.onConfigurationLoaded.subscribe(() => {

    //  const authWellKnownEndpoints = new AuthWellKnownEndpoints();
    //  authWellKnownEndpoints.setWellKnownEndpoints(this.oidcConfigService.wellKnownEndpoints);

    //  const openIDImplicitFlowConfiguration = new OpenIDImplicitFlowConfiguration();
    //  openIDImplicitFlowConfiguration.stsServer = 'https://login.microsoftonline.com/ed48a4e2-9762-4f41-8a15-9bcd99965fab/v2.0/';//this.oidcConfigService.wellKnownEndpoints.issuer;
    //  openIDImplicitFlowConfiguration.redirect_url = this.oidcConfigService.clientConfiguration.redirect_url;
    //  openIDImplicitFlowConfiguration.client_id = this.oidcConfigService.clientConfiguration.client_id;
    //  openIDImplicitFlowConfiguration.response_type = this.oidcConfigService.clientConfiguration.response_type;
    //  openIDImplicitFlowConfiguration.scope = this.oidcConfigService.clientConfiguration.scope;
    //  openIDImplicitFlowConfiguration.post_logout_redirect_uri = this.oidcConfigService.clientConfiguration.post_logout_redirect_uri;
    //  openIDImplicitFlowConfiguration.start_checksession = this.oidcConfigService.clientConfiguration.start_checksession;
    //  openIDImplicitFlowConfiguration.silent_renew = this.oidcConfigService.clientConfiguration.silent_renew;
    //  openIDImplicitFlowConfiguration.silent_renew_url = this.oidcConfigService.clientConfiguration.silent_renew_url;
    //  openIDImplicitFlowConfiguration.post_login_route = '/home';
    //  openIDImplicitFlowConfiguration.forbidden_route = this.oidcConfigService.clientConfiguration.forbidden_route;
    //  openIDImplicitFlowConfiguration.unauthorized_route = this.oidcConfigService.clientConfiguration.unauthorized_route;
    //  openIDImplicitFlowConfiguration.auto_userinfo = this.oidcConfigService.clientConfiguration.auto_userinfo;
    //  openIDImplicitFlowConfiguration.log_console_warning_active = this.oidcConfigService.clientConfiguration.log_console_warning_active;
    //  openIDImplicitFlowConfiguration.log_console_debug_active = this.oidcConfigService.clientConfiguration.log_console_debug_active;
    //  openIDImplicitFlowConfiguration.max_id_token_iat_offset_allowed_in_seconds =
    //    this.oidcConfigService.clientConfiguration.max_id_token_iat_offset_allowed_in_seconds;

    //  openIDImplicitFlowConfiguration.iss_validation_off = true;

    //  this.oidcSecurityService.setupModule(openIDImplicitFlowConfiguration, authWellKnownEndpoints);

    //  //this.oidcSecurityService.setCustomRequestParameters(this.oidcConfigService.clientConfiguration.additional_login_parameters);
    //  this.oidcSecurityService.setCustomRequestParameters({ response_mode: 'fragment' } );
    //});

    console.log('APP STARTING');
  }
}
