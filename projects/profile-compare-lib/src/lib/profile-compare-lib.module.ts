import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { ProfileComparisonComponent } from './components/profile-comparison.component';
import { ApiService } from './services/api.service';

@NgModule({
  declarations: [
    ProfileComparisonComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    DragDropModule
  ],
  exports: [
    ProfileComparisonComponent
  ],
  providers: [
    ApiService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfileCompareLibModule { }
