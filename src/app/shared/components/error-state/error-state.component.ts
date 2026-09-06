import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorState {
  readonly title = input('Something went wrong');
  readonly message = input('The data could not be loaded.');
  readonly retry = output<void>();
}
