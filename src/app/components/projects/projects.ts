import { Component } from '@angular/core';

@Component({
  selector: 'app-projects',
  imports: [],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  projects = [
    {
      title: 'Data Pipeline Orchestrator',
      description: 'An end-to-end data pipeline processing terabytes of log data, built with Python, Apache Airflow, and AWS. Reduced processing time by 40%.',
      technologies: ['Python', 'Airflow', 'AWS', 'SQL'],
      githubLink: '#',
      liveLink: '#'
    },
    {
      title: 'Customer Analytics Dashboard',
      description: 'Interactive dashboard providing real-time insights into customer retention and behavior. Built the backend in Node.js and frontend in Angular.',
      technologies: ['Angular', 'Node.js', 'D3.js', 'PostgreSQL'],
      githubLink: '#',
      liveLink: '#'
    },
    {
      title: 'Machine Learning Churn Predictor',
      description: 'A predictive model identifying customers at high risk of churn with 85% accuracy. Deployed as a REST API using FastAPI.',
      technologies: ['Python', 'Scikit-Learn', 'FastAPI', 'Docker'],
      githubLink: '#',
      liveLink: '#'
    },
    {
      title: 'Real-time Chat Application',
      description: 'A scalable, real-time messaging application featuring group chats, read receipts, and typing indicators.',
      technologies: ['TypeScript', 'React', 'Socket.io', 'MongoDB'],
      githubLink: '#',
      liveLink: '#'
    }
  ];
}
