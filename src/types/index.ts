export type EventStatus = 'upcoming' | 'ongoing' | 'completed';

export interface EventItem {
  id: string; // e.g. "EK-2026-001"
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM - 1:00 PM"
  venue: string;
  imageUrl: string;
  status: EventStatus;
  contactEmail: string; // robokalam@gmail.com
  category: 'Workshops' | 'Open Mic' | 'Hackathons' | 'AI & Tech' | 'Conferences';
  capacity: number;
  registeredCount: number;
  createdAt: string;
  highlights?: string[];
  videoUrl?: string;
}

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  status: 'active' | 'suspended';
  createdAt: string;
  avatarUrl?: string;
}

export type RegistrationStatus = 'confirmed' | 'pending' | 'cancelled';

export interface EventRegistration {
  id: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  registrationDate: string;
  status: RegistrationStatus;
  ticketCode: string;
}

export interface EventMediaItem {
  id: string;
  eventId: string;
  mediaType: 'photo' | 'video';
  fileUrl: string;
  caption: string;
  uploadedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export interface EmailNotification {
  id: string;
  type: 'event_created' | 'event_updated' | 'registration_confirmed';
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  timestamp: string;
  status: 'sent' | 'queued' | 'simulated';
}
