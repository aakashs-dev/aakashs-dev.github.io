import { Component } from '@angular/core';

@Component({
  selector: 'app-extracurricular',
  imports: [],
  templateUrl: './extracurricular.html',
  styleUrl: './extracurricular.scss',
})
export class Extracurricular {
  activities = [
    {
      title: 'Open Source Contributor',
      role: 'Various Repositories • 2021 - Present',
      description: 'Actively contributing to popular open-source data science libraries and Angular UI components, fixing bugs and adding new features.',
      icon: '🌐'
    },
    {
      title: 'Tech Meetup Organizer',
      role: 'San Francisco Tech • 2023 - Present',
      description: 'Organizing monthly meetups for local developers and data enthusiasts. Facilitating talks and networking sessions for over 200 members.',
      icon: '🎤'
    },
    {
      title: 'Hackathon Mentor',
      role: 'Global Hack Week • 2022, 2023',
      description: 'Mentored college students in building their first full-stack applications and deploying machine learning models during 48-hour sprints.',
      icon: '💡'
    },
    {
      title: 'Tech Blog Writer',
      role: 'Medium & Dev.to',
      description: 'Writing technical articles on data engineering pipelines and frontend architecture, garnering over 10,000 monthly reads.',
      icon: '✍️'
    }
  ];
}
