import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'app';
  watcher: Subscription;
  isMobile: boolean;
  isMediaInitialized: boolean;

  constructor(media: ObservableMedia) {
    this.watcher = media.subscribe((change: MediaChange) => {
      let mobile = change.mqAlias == 'xs';
      if (!this.isMediaInitialized) {
        this.isMobile = mobile;
        this.isMediaInitialized = true;
      } else {
        if (mobile != this.isMobile) {
          this.isMobile = mobile;
          // force a page reload to avoid routing problems
          // when media changes after initialization
          if (environment.production) window.location.reload();
        }
      }
    });
  }

  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
}
