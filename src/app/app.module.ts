import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProfileCompareLibModule } from '../../projects/profile-compare-lib/src/lib/profile-compare-lib.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ProfileCompareLibModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
