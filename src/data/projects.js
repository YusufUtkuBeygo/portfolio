// One entry per project = one cartridge on the desk. Add a new block here when a project ships.
// `highlights` are the bullet points in the case study panel; leave it out if there is nothing yet.
// `status` shows a small badge (e.g. 'In progress'); remove it once the project ships.
export const projects = [
  {
    id: 'watchit',
    title: 'WatchIt',
    summary: 'A video sharing platform I built to learn backend development end to end.',
    highlights: [
      'REST API for channels, videos, comments, playlists and watch history, secured with JWT.',
      'PostgreSQL with Flyway migrations; videos upload straight to MinIO through presigned URLs.',
      'React frontend; the whole stack runs locally with Docker Compose.',
    ],
    stack: ['Java', 'Spring Boot', 'PostgreSQL', 'MinIO', 'React'],
    color: '#b3245b',
    repo: 'https://github.com/YusufUtkuBeygo/watchit',
    demo: '',
  },
  {
    id: 'ataturk-uni',
    title: 'Ataturk Uni Site',
    summary: 'Responsive 21-page redesign of the Atatürk University website, built for my Web Design course.',
    highlights: [
      '21 pages: faculties, programs, calendars, announcements, clubs, shuttle times, cafeteria menu and more.',
      'Responsive Bootstrap 4 grid with a collapsible navbar; contact page with form and map.',
      'Shared stylesheet plus one per page, with comments explaining each block.',
    ],
    stack: ['HTML', 'CSS', 'Bootstrap', 'jQuery'],
    color: '#d9822b',
    repo: 'https://github.com/YusufUtkuBeygo/ataturk-university-website',
    demo: 'https://yusufutkubeygo.github.io/ataturk-university-website/',
  },
  {
    id: 'image-processing',
    title: 'Image Processing',
    summary: 'Course project: classic image processing techniques applied to a photo set I shoot myself.',
    status: 'In progress',
    stack: ['Python', 'OpenCV'],
    color: '#3d7bb3',
    repo: '',
    demo: '',
  },
  {
    id: 'esp32',
    title: 'ESP32 Lab',
    summary: 'Small programs on an ESP32 microcontroller (LEDs, sensors, serial data): my first steps toward edge AI.',
    status: 'In progress',
    stack: ['C++', 'ESP32'],
    color: '#4f9a4a',
    repo: '',
    demo: '',
  },
];
