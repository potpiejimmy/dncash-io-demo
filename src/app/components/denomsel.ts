import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: 'denom-sel',
    templateUrl: 'denomsel.html'
})
export class DenomSelComponent {

    @Input()
    denom: number;

    @Output()
    updated: EventEmitter<void> = new EventEmitter();

    count: number = 0;

    plus() {
        this.count++;
        this.updated.emit();
    }

    minus() {
        this.count = Math.max(0, this.count-1);
        this.updated.emit();
    }

    amount() {
        return this.denom * this.count;
    }
}
