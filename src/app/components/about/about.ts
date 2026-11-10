import { Component } from '@angular/core';
import { PROFILE } from '../../profile';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  readonly profile = PROFILE;
}
