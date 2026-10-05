import { EventItem, UserProfile, EventRegistration, EventMediaItem, ContactMessage } from '../types';

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'EK-2026-001',
    title: 'Warangal Open Mic — Great Ideas Build Tomorrow',
    description: 'A vibrant open-mic rooftop gathering bringing together thinkers, young engineers, creators, and entrepreneurs across Warangal and Hanumkonda. Participants shared creative ideas, spoken stories, and technology visions in a relaxed community atmosphere.',
    date: '2026-09-30',
    time: '5:30 PM - 8:30 PM',
    venue: 'Rooftop Community Arena, Hanumkonda, Telangana 506001',
    imageUrl: '', // Ready for photo upload or preview
    status: 'completed',
    contactEmail: 'robokalam@gmail.com',
    category: 'Open Mic',
    capacity: 75,
    registeredCount: 68,
    createdAt: '2026-09-10T10:00:00Z',
    highlights: [
      'Over 60+ participants gathered under the sunset rooftop stage',
      '14 lightning talks on technology, AI ethics, and local startups',
      'Community networking and idea exchange hosted by Robokalam',
      'Live Q&A and interactive audience engagement'
    ],
    videoUrl: ''
  },
  {
    id: 'EK-2026-002',
    title: 'AI for ALL — 10,000+ Youth AI Upskilling Initiative',
    description: 'Official launch of the flagship "AI for ALL" skilling campaign on World Youth Skills Day. Conducted by Robokalam Technologies in partnership with Samaritans NGO, NASSCOM Foundation, T-Hub, and ecosystem partners, empowering youth with practical AI & digital skills.',
    date: '2026-07-15',
    time: '10:00 AM - 2:00 PM',
    venue: 'Robokalam Innovation Centre, Hanumkonda, Telangana 506001',
    imageUrl: '',
    status: 'completed',
    contactEmail: 'robokalam@gmail.com',
    category: 'AI & Tech',
    capacity: 150,
    registeredCount: 142,
    createdAt: '2026-06-20T10:00:00Z',
    highlights: [
      'Official initiative launch with regional educational and NGO leaders',
      'Target to upskill 10,000+ candidates in practical Artificial Intelligence',
      'Supported by ecosystem partners including NASSCOM Foundation & T-Hub',
      'Certificate distribution and lab orientation for the first cohort'
    ],
    videoUrl: ''
  },
  {
    id: 'EK-2026-003',
    title: 'Robokalam 21st Century Robotics & IoT Masterclass',
    description: 'Hands-on hardware masterclass designed for engineering students and hobbyists. Build your first IoT-enabled sensor hub, master microcontrollers, and learn real-world autonomous robotic motion fundamentals directly from engineers.',
    date: '2026-10-24',
    time: '09:30 AM - 04:30 PM',
    venue: 'Robokalam Advanced Labs, Hanumkonda, Telangana 506001',
    imageUrl: '',
    status: 'upcoming',
    contactEmail: 'robokalam@gmail.com',
    category: 'Workshops',
    capacity: 40,
    registeredCount: 28,
    createdAt: '2026-09-15T09:00:00Z',
    highlights: [
      'Complete hardware kit provided during the workshop',
      'Direct hands-on building: Embedded C, ESP32, and Cloud Telemetry',
      'Official certification by Robokalam Technologies',
      'One-on-one project guidance by senior technical mentors'
    ]
  },
  {
    id: 'EK-2026-004',
    title: 'Warangal Tech Innovators & Startup Meetup 2026',
    description: 'A focused weekend networking session connecting local student entrepreneurs, software developers, and tech enthusiasts. Discuss emerging tech stacks, local problem-solving, and collaborating on upcoming regional hackathons.',
    date: '2026-11-07',
    time: '02:00 PM - 05:30 PM',
    venue: 'District Innovation Hall, Subedari, Hanumkonda 506001',
    imageUrl: '',
    status: 'upcoming',
    contactEmail: 'robokalam@gmail.com',
    category: 'Conferences',
    capacity: 100,
    registeredCount: 45,
    createdAt: '2026-09-20T11:00:00Z',
    highlights: [
      'Panel discussion on regional tech entrepreneurship in Tier-2 cities',
      'Demo hour for student prototypes and software projects',
      'Coffee & structured networking circle'
    ]
  },
  {
    id: 'EK-2026-005',
    title: 'Practical Full-Stack Web Architecture Bootcamp',
    description: 'A deep-dive technical workshop focused on building production-ready web apps: modern component architectures, relational schema design, secure authentication, and cloud deployment pipelines.',
    date: '2026-11-21',
    time: '10:00 AM - 04:00 PM',
    venue: 'Robokalam Training Wing, Hanumkonda, Telangana 506001',
    imageUrl: '',
    status: 'upcoming',
    contactEmail: 'robokalam@gmail.com',
    category: 'Workshops',
    capacity: 50,
    registeredCount: 19,
    createdAt: '2026-09-25T14:00:00Z',
    highlights: [
      'Interactive coding with real-time deployment exercises',
      'Best practices for database security, REST & serverless APIs',
      'Includes digital badge and Robokalam workshop certificate'
    ]
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-01',
    name: 'Mohammed Sajeed',
    email: 'admin@eventkalam.com',
    role: 'admin',
    phone: '+91 98765 43210',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    avatarUrl: ''
  },
  {
    id: 'usr-demo-01',
    name: 'Rahul Verma',
    email: 'rahul.verma@gmail.com',
    role: 'user',
    phone: '+91 91234 56789',
    status: 'active',
    createdAt: '2026-09-01T12:00:00Z',
    avatarUrl: ''
  },
  {
    id: 'usr-demo-02',
    name: 'Priyanka Reddy',
    email: 'priyanka.r@gmail.com',
    role: 'user',
    phone: '+91 94567 89012',
    status: 'active',
    createdAt: '2026-09-12T14:30:00Z',
    avatarUrl: ''
  },
  {
    id: 'usr-demo-03',
    name: 'Karthik Rao',
    email: 'karthik.rao@gmail.com',
    role: 'user',
    phone: '+91 98877 66554',
    status: 'active',
    createdAt: '2026-09-18T10:15:00Z',
    avatarUrl: ''
  }
];

export const INITIAL_REGISTRATIONS: EventRegistration[] = [
  {
    id: 'reg-001',
    userId: 'usr-demo-01',
    eventId: 'EK-2026-003',
    eventTitle: 'Robokalam 21st Century Robotics & IoT Masterclass',
    eventDate: '2026-10-24',
    eventTime: '09:30 AM - 04:30 PM',
    eventVenue: 'Robokalam Advanced Labs, Hanumkonda',
    userName: 'Rahul Verma',
    userEmail: 'rahul.verma@gmail.com',
    userPhone: '+91 91234 56789',
    registrationDate: '2026-09-22T08:15:00Z',
    status: 'confirmed',
    ticketCode: 'EK-TKT-884102'
  },
  {
    id: 'reg-002',
    userId: 'usr-demo-01',
    eventId: 'EK-2026-001',
    eventTitle: 'Warangal Open Mic — Great Ideas Build Tomorrow',
    eventDate: '2026-09-30',
    eventTime: '5:30 PM - 8:30 PM',
    eventVenue: 'Rooftop Community Arena, Hanumkonda',
    userName: 'Rahul Verma',
    userEmail: 'rahul.verma@gmail.com',
    userPhone: '+91 91234 56789',
    registrationDate: '2026-09-14T11:20:00Z',
    status: 'confirmed',
    ticketCode: 'EK-TKT-312940'
  },
  {
    id: 'reg-003',
    userId: 'usr-demo-02',
    eventId: 'EK-2026-003',
    eventTitle: 'Robokalam 21st Century Robotics & IoT Masterclass',
    eventDate: '2026-10-24',
    eventTime: '09:30 AM - 04:30 PM',
    eventVenue: 'Robokalam Advanced Labs, Hanumkonda',
    userName: 'Priyanka Reddy',
    userEmail: 'priyanka.r@gmail.com',
    userPhone: '+91 94567 89012',
    registrationDate: '2026-09-25T14:40:00Z',
    status: 'confirmed',
    ticketCode: 'EK-TKT-991204'
  },
  {
    id: 'reg-004',
    userId: 'usr-demo-03',
    eventId: 'EK-2026-004',
    eventTitle: 'Warangal Tech Innovators & Startup Meetup 2026',
    eventDate: '2026-11-07',
    eventTime: '02:00 PM - 05:30 PM',
    eventVenue: 'District Innovation Hall, Subedari, Hanumkonda',
    userName: 'Karthik Rao',
    userEmail: 'karthik.rao@gmail.com',
    userPhone: '+91 98877 66554',
    registrationDate: '2026-09-28T09:30:00Z',
    status: 'confirmed',
    ticketCode: 'EK-TKT-452109'
  }
];

export const INITIAL_MEDIA: EventMediaItem[] = [
  {
    id: 'med-001',
    eventId: 'EK-2026-001',
    mediaType: 'photo',
    fileUrl: '', // Ready for photo upload or preview
    caption: 'Stage and audience during the Warangal Open Mic rooftop session at Hanumkonda',
    uploadedAt: '2026-10-01T09:00:00Z'
  },
  {
    id: 'med-002',
    eventId: 'EK-2026-002',
    mediaType: 'photo',
    fileUrl: '',
    caption: 'Official launch of AI for ALL upskilling initiative with Robokalam & partners',
    uploadedAt: '2026-07-16T11:00:00Z'
  },
  {
    id: 'med-003',
    eventId: 'EK-2026-002',
    mediaType: 'photo',
    fileUrl: '',
    caption: 'Youth candidates and team holding the initiative posters during World Youth Skills Day',
    uploadedAt: '2026-07-16T11:30:00Z'
  }
];

export const INITIAL_CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-001',
    name: 'Suresh Kumar',
    email: 'suresh.k@gmail.com',
    subject: 'Robotics workshop group booking for college',
    message: 'Hello Robokalam team, we would like to register a group of 15 students for the upcoming robotics masterclass. Is there a group registration assistance available?',
    status: 'read',
    createdAt: '2026-09-28T16:00:00Z'
  }
];

export const FOUNDERS_DATA = {
  founder: {
    name: 'Mohammed Sajeed',
    role: 'Founder, Robokalam',
    company: 'Robokalam Technologies',
    bio: 'Founder of Robokalam Technologies. Leading innovation initiatives, technical training programs, and community-driven event platforms across Hanumkonda and Telangana.',
    verified: true,
    photoUrl: '', // Real photo uploadable / replaceable directly in UI
    links: {
      email: 'robokalam@gmail.com'
    }
  },
  coFounder: {
    name: 'Rajashekhar Kota',
    role: 'Co-Founder, Robokalam',
    company: 'Robokalam Technologies',
    bio: 'Co-Founder of Robokalam Technologies. Overseeing strategic outreach, youth skill enablement, and organizational operations for EventKalam and Robokalam programs.',
    verified: true,
    photoUrl: '', // Real photo uploadable / replaceable directly in UI
    links: {
      email: 'robokalam@gmail.com'
    }
  },
  company: {
    name: 'Robokalam Technologies',
    location: 'Hanumkonda, Telangana – PIN: 506001',
    address: 'Hanumkonda, Telangana, 506001',
    email: 'robokalam@gmail.com',
    temporaryPhone: '+91 (Placeholder - Official number to be updated)',
    socials: {
      twitter: 'https://x.com/robokalam',
      facebook: 'https://www.facebook.com/robokalam/',
      instagram: 'https://www.instagram.com/robokalam'
    }
  }
};
