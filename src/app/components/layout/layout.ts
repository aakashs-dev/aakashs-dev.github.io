import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidenav } from '../sidenav/sidenav';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Sidenav, Footer],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {}
