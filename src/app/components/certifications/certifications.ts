import { Component } from '@angular/core';
import { PROFILE } from '../../profile';

interface Certification {
  title: string;
  issuer: string;
  date: string;
  credentialId?: string;
  credentialUrl?: string;
}

@Component({
  selector: 'app-certifications',
  imports: [],
  templateUrl: './certifications.html',
  styleUrl: './certifications.scss',
})
export class Certifications {
  certifications: Certification[] = [
    {
      title: 'Chartered Financial Analyst (CFA) Program – Level I',
      issuer: 'CFA Institute',
      date: PROFILE.cfaLevelIPassed,
      credentialUrl: 'https://credentials.cfainstitute.org/5037283a-d604-44bb-8539-9b1632279db8'
    }
  ];
}
