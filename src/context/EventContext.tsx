import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventItem, EventRegistration, EventMediaItem, ContactMessage, EmailNotification } from '../types';
import { INITIAL_EVENTS, INITIAL_REGISTRATIONS, INITIAL_MEDIA, INITIAL_CONTACT_MESSAGES } from '../data/initialData';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface EventContextType {
  events: EventItem[];
  registrations: EventRegistration[];
  media: EventMediaItem[];
  contactMessages: ContactMessage[];
  emailNotifications: EmailNotification[];
  // Event Operations (Strictly Admin Authorized)
  createEvent: (eventData: Omit<EventItem, 'createdAt' | 'registeredCount'>) => Promise<{ success: boolean; error?: string }>;
  updateEvent: (id: string, updates: Partial<EventItem>) => Promise<{ success: boolean; error?: string }>;
  deleteEvent: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshEvents: () => Promise<void>;
  getEventById: (id: string) => EventItem | undefined;
  // Registration Operations
  registerForEvent: (eventId: string, details: { name: string; email: string; phone: string }) => Promise<{ success: boolean; ticketCode?: string; error?: string }>;
  cancelRegistration: (registrationId: string) => Promise<{ success: boolean; error?: string }>;
  getUserRegistrations: (userId: string) => EventRegistration[];
  getEventRegistrations: (eventId: string) => EventRegistration[];
  updateRegistrationStatus: (regId: string, status: 'confirmed' | 'pending' | 'cancelled') => Promise<void>;
  // Media Operations (Strictly Admin Authorized)
  addMediaItem: (mediaData: Omit<EventMediaItem, 'id' | 'uploadedAt'>) => Promise<{ success: boolean; error?: string }>;
  deleteMediaItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  getEventMedia: (eventId: string) => EventMediaItem[];
  // Contact Message Operations
  submitContactMessage: (name: string, email: string, subject: string, message: string) => Promise<{ success: boolean; error?: string }>;
  markMessageRead: (id: string) => void;
  // Email Automation Queue
  clearNotifications: () => void;
  resendNotification: (id: string) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const STORAGE_EVENTS_KEY = 'eventkalam_events_v2';
const STORAGE_REGS_KEY = 'eventkalam_registrations_v2';
const STORAGE_MEDIA_KEY = 'eventkalam_media_v2';
const STORAGE_MSGS_KEY = 'eventkalam_messages_v2';
const STORAGE_EMAILS_KEY = 'eventkalam_emails_v2';

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [media, setMedia] = useState<EventMediaItem[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [emailNotifications, setEmailNotifications] = useState<EmailNotification[]>([]);

  // Load from local storage or defaults on mount, and sync with Supabase if configured
  useEffect(() => {
    // Events
    const storedEvents = localStorage.getItem(STORAGE_EVENTS_KEY);
    if (storedEvents) {
      try {
        setEvents(JSON.parse(storedEvents));
      } catch (e) {
        setEvents(INITIAL_EVENTS);
      }
    } else {
      setEvents(INITIAL_EVENTS);
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
    }

    // Registrations
    const storedRegs = localStorage.getItem(STORAGE_REGS_KEY);
    if (storedRegs) {
      try {
        setRegistrations(JSON.parse(storedRegs));
      } catch (e) {
        setRegistrations(INITIAL_REGISTRATIONS);
      }
    } else {
      setRegistrations(INITIAL_REGISTRATIONS);
      localStorage.setItem(STORAGE_REGS_KEY, JSON.stringify(INITIAL_REGISTRATIONS));
    }

    // Media
    const storedMedia = localStorage.getItem(STORAGE_MEDIA_KEY);
    if (storedMedia) {
      try {
        setMedia(JSON.parse(storedMedia));
      } catch (e) {
        setMedia(INITIAL_MEDIA);
      }
    } else {
      setMedia(INITIAL_MEDIA);
      localStorage.setItem(STORAGE_MEDIA_KEY, JSON.stringify(INITIAL_MEDIA));
    }

    // Messages
    const storedMsgs = localStorage.getItem(STORAGE_MSGS_KEY);
    if (storedMsgs) {
      try {
        setContactMessages(JSON.parse(storedMsgs));
      } catch (e) {
        setContactMessages(INITIAL_CONTACT_MESSAGES);
      }
    } else {
      setContactMessages(INITIAL_CONTACT_MESSAGES);
      localStorage.setItem(STORAGE_MSGS_KEY, JSON.stringify(INITIAL_CONTACT_MESSAGES));
    }

    // Email notifications
    const storedEmails = localStorage.getItem(STORAGE_EMAILS_KEY);
    if (storedEmails) {
      try {
        setEmailNotifications(JSON.parse(storedEmails));
      } catch (e) {
        setEmailNotifications([]);
      }
    }

    // Synchronize from live Supabase if connected
    if (supabase) {
      fetchEvents();
    }
  }, []);

  // Fetch events directly from public.events
  const fetchEvents = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching events from public.events:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const mapped: EventItem[] = data.map((d: any) => ({
          id: d.event_id || d.id,
          title: d.title,
          description: d.description || '',
          date: d.event_date || d.date || '',
          time: d.event_time || d.time || '',
          venue: d.venue || '',
          imageUrl: d.image_url || '',
          status: (d.status as any) || 'upcoming',
          contactEmail: d.contact_email || 'robokalam@gmail.com',
          category: d.category || 'AI & Tech',
          capacity: d.seat_capacity ?? d.capacity ?? 100,
          registeredCount: 0,
          createdAt: d.created_at || new Date().toISOString(),
          highlights: Array.isArray(d.highlights) ? d.highlights : [],
          videoUrl: d.video_url || ''
        }));
        setEvents(mapped);
        localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(mapped));
      }
    } catch (err) {
      console.warn('Exception querying public.events:', err);
    }
  };

  const saveEvents = (updated: EventItem[]) => {
    setEvents(updated);
    localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(updated));
  };

  const saveRegistrations = (updated: EventRegistration[]) => {
    setRegistrations(updated);
    localStorage.setItem(STORAGE_REGS_KEY, JSON.stringify(updated));
  };

  const saveMedia = (updated: EventMediaItem[]) => {
    setMedia(updated);
    localStorage.setItem(STORAGE_MEDIA_KEY, JSON.stringify(updated));
  };

  const saveMessages = (updated: ContactMessage[]) => {
    setContactMessages(updated);
    localStorage.setItem(STORAGE_MSGS_KEY, JSON.stringify(updated));
  };

  const saveEmails = (updated: EmailNotification[]) => {
    setEmailNotifications(updated);
    localStorage.setItem(STORAGE_EMAILS_KEY, JSON.stringify(updated));
  };

  // Helper to trigger automated modular emails
  const triggerEmailNotification = (
    type: EmailNotification['type'],
    recipientEmail: string,
    recipientName: string,
    subject: string,
    body: string
  ) => {
    const notification: EmailNotification = {
      id: `eml-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      recipientEmail,
      recipientName,
      subject,
      body,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    const updated = [notification, ...emailNotifications];
    saveEmails(updated);
  };

  // CREATE EVENT (Strict Admin Authorization & public.events Database Source of Truth)
  const createEvent = async (eventData: Omit<EventItem, 'createdAt' | 'registeredCount'>): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Authorization error: Only administrators are authorized to create events.' };
    }

    if (!eventData.title || !eventData.id || !eventData.date || !eventData.time || !eventData.venue) {
      return { success: false, error: 'All fields including Event ID, Title, Date, Time, and Venue are required.' };
    }

    if (events.some(e => e.id.toLowerCase() === eventData.id.toLowerCase())) {
      return { success: false, error: `Event ID "${eventData.id}" already exists. Please choose a unique identifier.` };
    }

    // Verify authenticated user's ID
    let authUserId = currentUser?.id;
    if (supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          authUserId = userData.user.id;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!authUserId) {
      return {
        success: false,
        error: 'Authentication error: Could not verify currently authenticated admin user ID.',
      };
    }

    const newEvent: EventItem = {
      ...eventData,
      registeredCount: 0,
      createdAt: new Date().toISOString(),
      contactEmail: eventData.contactEmail || 'robokalam@gmail.com'
    };

    // If Supabase is connected, insert directly into public.events
    if (supabase) {
      try {
        const rowPayload: any = {
          id: crypto.randomUUID(),
          event_id: newEvent.id.trim(),
          category: newEvent.category,
          title: newEvent.title.trim(),
          event_date: newEvent.date,
          event_time: newEvent.time.trim(),
          seat_capacity: Number(newEvent.capacity),
          venue: newEvent.venue.trim(),
          contact_email: newEvent.contactEmail || 'robokalam@gmail.com',
          status: newEvent.status,
          image_url: newEvent.imageUrl || '',
          description: newEvent.description.trim(),
          highlights: Array.isArray(newEvent.highlights) ? newEvent.highlights : [],
          created_by: authUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from('events')
          .insert(rowPayload);

        if (insertError) {
          console.error('Supabase public.events insert error:', insertError);
          return { success: false, error: insertError.message || 'Failed to insert event into database.' };
        }
      } catch (err: any) {
        console.error('Supabase public.events exception:', err);
        return { success: false, error: err?.message || 'Failed to insert event into database.' };
      }
    }

    // Refresh event list from the database
    await fetchEvents();

    const updated = [newEvent, ...events.filter(e => e.id !== newEvent.id)];
    saveEvents(updated);

    // Automation: Dispatch notification to registered users about the new event
    triggerEmailNotification(
      'event_created',
      'registered_members@eventkalam.com',
      'EventKalam Community',
      `New Event Announcement: ${newEvent.title}`,
      `A new event "${newEvent.title}" has been scheduled for ${newEvent.date} at ${newEvent.venue}. Learn more and register at EventKalam.`
    );

    return { success: true };
  };

  // UPDATE EVENT (Strict Admin Authorization)
  const updateEvent = async (id: string, updates: Partial<EventItem>): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Authorization error: Only administrators are authorized to modify events.' };
    }

    const existing = events.find(e => e.id === id);
    if (!existing) {
      return { success: false, error: 'Event not found.' };
    }

    if (supabase) {
      try {
        const updatePayload: any = {
          updated_at: new Date().toISOString()
        };
        if (updates.title !== undefined) updatePayload.title = updates.title;
        if (updates.description !== undefined) updatePayload.description = updates.description;
        if (updates.date !== undefined) updatePayload.event_date = updates.date;
        if (updates.time !== undefined) updatePayload.event_time = updates.time;
        if (updates.venue !== undefined) updatePayload.venue = updates.venue;
        if (updates.imageUrl !== undefined) updatePayload.image_url = updates.imageUrl;
        if (updates.status !== undefined) updatePayload.status = updates.status;
        if (updates.contactEmail !== undefined) updatePayload.contact_email = updates.contactEmail;
        if (updates.category !== undefined) updatePayload.category = updates.category;
        if (updates.capacity !== undefined) updatePayload.seat_capacity = updates.capacity;
        if (updates.highlights !== undefined) updatePayload.highlights = updates.highlights;

        const { error } = await supabase
          .from('events')
          .update(updatePayload)
          .eq('event_id', id);

        if (error) {
          await supabase.from('events').update(updatePayload).eq('id', id);
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to update event in database.' };
      }
    }

    await fetchEvents();
    const updated = events.map(e => (e.id === id ? { ...e, ...updates } : e));
    saveEvents(updated);
    return { success: true };
  };

  // DELETE EVENT (Strict Admin Authorization)
  const deleteEvent = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Authorization error: Only administrators are authorized to delete events.' };
    }

    if (supabase) {
      try {
        const { error } = await supabase.from('events').delete().eq('event_id', id);
        if (error) {
          await supabase.from('events').delete().eq('id', id);
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to delete event from database.' };
      }
    }

    await fetchEvents();
    const updated = events.filter(e => e.id !== id);
    saveEvents(updated);

    // Also remove associated registrations
    const updatedRegs = registrations.filter(r => r.eventId !== id);
    saveRegistrations(updatedRegs);

    return { success: true };
  };

  const getEventById = (id: string) => {
    return events.find(e => e.id === id);
  };

  // REGISTER FOR EVENT
  const registerForEvent = async (
    eventId: string,
    details: { name: string; email: string; phone: string }
  ): Promise<{ success: boolean; ticketCode?: string; error?: string }> => {
    const event = events.find(e => e.id === eventId);
    if (!event) {
      return { success: false, error: 'Event does not exist.' };
    }

    if (event.status === 'completed') {
      return { success: false, error: 'This event has already taken place. Please check upcoming events.' };
    }

    if (event.registeredCount >= event.capacity) {
      return { success: false, error: 'Event is fully booked. Registration capacity reached.' };
    }

    // Check duplicate registration
    const existing = registrations.find(
      r => r.eventId === eventId && r.userEmail.toLowerCase() === details.email.toLowerCase() && r.status !== 'cancelled'
    );
    if (existing) {
      return { success: false, error: 'You are already registered for this event. Ticket code: ' + existing.ticketCode };
    }

    const randomTicketSuffix = Math.floor(100000 + Math.random() * 900000);
    const ticketCode = `EK-TKT-${randomTicketSuffix}`;

    const newRegistration: EventRegistration = {
      id: `reg-${Date.now().toString(36)}`,
      userId: currentUser ? currentUser.id : `guest-${Date.now().toString(36)}`,
      eventId,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      userName: details.name.trim(),
      userEmail: details.email.trim().toLowerCase(),
      userPhone: details.phone.trim(),
      registrationDate: new Date().toISOString(),
      status: 'confirmed',
      ticketCode
    };

    if (supabase) {
      try {
        await supabase.from('registrations').insert({
          user_id: currentUser?.id || null,
          event_id: eventId,
          user_name: newRegistration.userName,
          user_email: newRegistration.userEmail,
          user_phone: newRegistration.userPhone,
          status: 'confirmed',
          ticket_code: ticketCode
        });
      } catch (err) {
        console.warn('Supabase registration insert note:', err);
      }
    }

    const updatedRegs = [newRegistration, ...registrations];
    saveRegistrations(updatedRegs);

    // Increment event registration count
    const updatedEvents = events.map(e =>
      e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e
    );
    saveEvents(updatedEvents);

    // Automation: Dispatch instant confirmation email
    triggerEmailNotification(
      'registration_confirmed',
      details.email.trim(),
      details.name.trim(),
      `Registration Confirmed: ${event.title} [${ticketCode}]`,
      `Hello ${details.name},\n\nYour registration for "${event.title}" is confirmed!\n\nTicket Code: ${ticketCode}\nDate: ${event.date}\nTime: ${event.time}\nVenue: ${event.venue}\nOrganizer: Robokalam Technologies (robokalam@gmail.com)\n\nPlease present this ticket code upon arrival.`
    );

    return { success: true, ticketCode };
  };

  // CANCEL REGISTRATION
  const cancelRegistration = async (registrationId: string): Promise<{ success: boolean; error?: string }> => {
    const reg = registrations.find(r => r.id === registrationId);
    if (!reg) return { success: false, error: 'Registration not found' };

    // Check authorization: must be user who registered or admin
    if (currentUser && currentUser.id !== reg.userId && !isAdmin) {
      return { success: false, error: 'Unauthorized to cancel this registration.' };
    }

    if (supabase) {
      try {
        await supabase
          .from('registrations')
          .update({ status: 'cancelled' })
          .eq('ticket_code', reg.ticketCode);
      } catch (err) {
        console.warn('Supabase registration cancellation note:', err);
      }
    }

    const updatedRegs = registrations.map(r =>
      r.id === registrationId ? { ...r, status: 'cancelled' as const } : r
    );
    saveRegistrations(updatedRegs);

    // Decrement event counter
    const updatedEvents = events.map(e =>
      e.id === reg.eventId ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) } : e
    );
    saveEvents(updatedEvents);

    return { success: true };
  };

  const getUserRegistrations = (userId: string) => {
    return registrations.filter(r => r.userId === userId || (currentUser && r.userEmail === currentUser.email));
  };

  const getEventRegistrations = (eventId: string) => {
    return registrations.filter(r => r.eventId === eventId);
  };

  const updateRegistrationStatus = async (regId: string, status: 'confirmed' | 'pending' | 'cancelled') => {
    if (!isAdmin) return;
    if (supabase) {
      const reg = registrations.find(r => r.id === regId);
      if (reg) {
        await supabase
          .from('registrations')
          .update({ status })
          .eq('ticket_code', reg.ticketCode);
      }
    }
    const updated = registrations.map(r => r.id === regId ? { ...r, status } : r);
    saveRegistrations(updated);
  };

  // MEDIA (Strictly Admin Authorized)
  const addMediaItem = async (mediaData: Omit<EventMediaItem, 'id' | 'uploadedAt'>): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Authorization error: Only administrators are authorized to add showcase media.' };
    }

    const newMedia: EventMediaItem = {
      ...mediaData,
      id: `med-${Date.now().toString(36)}`,
      uploadedAt: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('event_media').insert({
          event_id: newMedia.eventId,
          media_type: newMedia.mediaType,
          file_url: newMedia.fileUrl,
          caption: newMedia.caption
        });

        if (error) {
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to insert showcase media.' };
      }
    }

    const updated = [newMedia, ...media];
    saveMedia(updated);
    return { success: true };
  };

  const deleteMediaItem = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Authorization error: Only administrators are authorized to delete showcase media.' };
    }

    if (supabase) {
      try {
        const { error } = await supabase.from('event_media').delete().eq('id', id);
        if (error) {
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to delete showcase media.' };
      }
    }

    const updated = media.filter(m => m.id !== id);
    saveMedia(updated);
    return { success: true };
  };

  const getEventMedia = (eventId: string) => {
    return media.filter(m => m.eventId === eventId);
  };

  // CONTACT MESSAGE
  const submitContactMessage = async (name: string, email: string, subject: string, message: string) => {
    if (!name || !email || !message) {
      return { success: false, error: 'Name, email, and message are required.' };
    }

    const newMsg: ContactMessage = {
      id: `msg-${Date.now().toString(36)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim() || 'General Inquiry',
      message: message.trim(),
      status: 'unread',
      createdAt: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('contact_messages').insert({
          name: newMsg.name,
          email: newMsg.email,
          subject: newMsg.subject,
          message: newMsg.message,
          status: 'unread'
        });
      } catch (err) {
        console.warn('Supabase contact insert note:', err);
      }
    }

    const updated = [newMsg, ...contactMessages];
    saveMessages(updated);

    // Also send an automated receipt
    triggerEmailNotification(
      'event_created',
      newMsg.email,
      newMsg.name,
      `Message Received: ${newMsg.subject} — Robokalam / EventKalam`,
      `Thank you for contacting Robokalam Technologies. Our team in Hanumkonda has received your message and will respond shortly via ${newMsg.email}.`
    );

    return { success: true };
  };

  const markMessageRead = (id: string) => {
    if (!isAdmin) return;
    const updated = contactMessages.map(m => m.id === id ? { ...m, status: 'read' as const } : m);
    saveMessages(updated);
  };

  const clearNotifications = () => {
    if (!isAdmin) return;
    saveEmails([]);
  };

  const resendNotification = (id: string) => {
    const item = emailNotifications.find(n => n.id === id);
    if (!item) return;
    triggerEmailNotification(
      item.type,
      item.recipientEmail,
      item.recipientName,
      `[Resent] ${item.subject}`,
      item.body
    );
  };

  return (
    <EventContext.Provider
      value={{
        events,
        registrations,
        media,
        contactMessages,
        emailNotifications,
        createEvent,
        updateEvent,
        deleteEvent,
        refreshEvents: fetchEvents,
        getEventById,
        registerForEvent,
        cancelRegistration,
        getUserRegistrations,
        getEventRegistrations,
        updateRegistrationStatus,
        addMediaItem,
        deleteMediaItem,
        getEventMedia,
        submitContactMessage,
        markMessageRead,
        clearNotifications,
        resendNotification
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
