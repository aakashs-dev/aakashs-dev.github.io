import { Component } from '@angular/core';
import { PROFILE } from '../../profile';

@Component({
  selector: 'app-resume',
  imports: [],
  templateUrl: './resume.html',
  styleUrl: './resume.scss',
})
export class Resume {
  readonly profile = PROFILE;
}
