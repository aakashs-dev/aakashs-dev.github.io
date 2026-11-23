import { TestBed } from '@angular/core/testing';
import { Resume } from './resume';

describe('Resume', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Resume],
    }).compileComponents();
  });

  it('renders separate dated entries for Gaming Supervisor, CSIRO Research, Teaching Assistant and NIIT', async () => {
    const fixture = TestBed.createComponent(Resume);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const titles = Array.from(el.querySelectorAll('.job-title')).map((h) => h.textContent?.trim());
    expect(titles).toEqual([
      'Gaming Supervisor',
      'Summer Vacation Research Scholar',
      'Teaching Assistant — FIT5196 Data Wrangling',
      'Software Engineer',
      'Chartered Financial Analyst (CFA) Program — Level I',
      'Master of Data Science',
      'Bachelor of Technology in Computer Science & Engineering',
    ]);
  });

  it('reflects the verified degree titles and CFA 2026 topic names without exposing private notes', async () => {
    const fixture = TestBed.createComponent(Resume);
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Financial Statement Analysis');
    expect(text).toContain('big data processing (Spark, PySpark, Hadoop)');
    expect(text).toContain('Algorithms, data structures, relational databases and operating systems.');
    expect(text).toContain('Doncaster Hotel (ALH Group)');
    expect(text).not.toContain('subclass 485');
    expect(text).not.toContain('research methodologies');
  });
});
