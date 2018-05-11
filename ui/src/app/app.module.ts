import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MainService } from './main.service';

import { AppComponent } from './app.component';
import { IndexComponent } from './index/index.component';
import { FilesystemComponent } from './filesystem/filesystem.component';
import { InputsComponent } from './inputs/inputs.component';
import { OutputsComponent } from './outputs/outputs.component';

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    FilesystemComponent,
    InputsComponent,
    OutputsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([
     {
      'path': '',
      'component': IndexComponent
     }
    ])
  ],
  providers: [
    MainService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  
}
