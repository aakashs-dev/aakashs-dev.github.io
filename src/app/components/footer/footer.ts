import { Component } from '@angular/core';
import { PROFILE } from '../../profile';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  readonly profile = PROFILE;
}
