import { Component } from '@angular/core';

@Component({
  selector: 'app-certifications',
  imports: [],
  templateUrl: './certifications.html',
  styleUrl: './certifications.scss',
})
export class Certifications {
  certifications = [
    {
      title: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      date: 'Aug 2023',
      credentialId: 'AWS-12345',
      credentialUrl: '#'
    },
    {
      title: 'Google Data Analytics Professional Certificate',
      issuer: 'Coursera / Google',
      date: 'Jan 2022',
      credentialId: 'GCP-98765',
      credentialUrl: '#'
    },
    {
      title: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation',
      date: 'Nov 2023',
      credentialId: 'CKA-45678',
      credentialUrl: '#'
    },
    {
      title: 'Microsoft Certified: Azure Data Engineer Associate',
      issuer: 'Microsoft',
      date: 'Mar 2024',
      credentialId: 'MS-89012',
      credentialUrl: '#'
    }
  ];
}
