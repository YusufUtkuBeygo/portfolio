// One entry per project = one cartridge on the desk. Add a new block here when a project ships.
// `highlights` are the bullet points in the case study panel; leave it out if there is nothing yet.
export const projects = [
  {
    id: 'watchit',
    title: 'WatchIt',
    summary: 'A video sharing platform I built to learn backend development end to end.',
    highlights: [
      'REST API for channels, videos, comments, playlists and watch history.',
      'PostgreSQL for data, MinIO object storage for video files.',
      'Runs locally with Docker Compose.',
    ],
    stack: ['Java', 'Spring Boot', 'PostgreSQL', 'MinIO', 'Docker'],
    color: '#b3245b',
    repo: '',
    demo: '',
  },
  {
    id: 'image-processing',
    title: 'Image Processing',
    summary: 'Course project built on my own photos. Coming soon.',
    stack: ['Python', 'OpenCV'],
    color: '#3d7bb3',
    repo: '',
    demo: '',
  },
  {
    id: 'esp32',
    title: 'ESP32 Lab',
    summary: 'First steps into edge AI on a microcontroller. Coming soon.',
    stack: ['C++', 'ESP32'],
    color: '#4f9a4a',
    repo: '',
    demo: '',
  },
];
