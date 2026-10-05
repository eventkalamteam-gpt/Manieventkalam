import React, { useState } from 'react';
import { EventItem, EventMediaItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { ImageSlot } from '../components/common/ImageSlot';
import { ImageUploadModal } from '../components/common/ImageUploadModal';
import { Calendar, MapPin, Play, Image as ImageIcon, Plus, Video, Sparkles, ExternalLink, X, ChevronRight } from 'lucide-react';

interface ShowcasePageProps {
  events: EventItem[];
  selectedEventId?: string;
  onNavigateToAdmin?: () => void;
}

export const ShowcasePage: React.FC<ShowcasePageProps> = ({
  events,
  selectedEventId,
  onNavigateToAdmin
}) => {
  const { isAdmin } = useAuth();
  const { media, addMediaItem } = useEvents();

  const completedEvents = events.filter((e) => e.status === 'completed');

  const [activeEventId, setActiveEventId] = useState<string>(
    selectedEventId || (completedEvents[0]?.id ?? '')
  );

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);

  const currentEvent = completedEvents.find((e) => e.id === activeEventId) || completedEvents[0];
  const eventMediaList = currentEvent ? media.filter((m) => m.eventId === currentEvent.id) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
            Archival Records & Media
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            EventKalam Showcase Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Explore verified photographs, videos, and key takeaways from past events, workshops, and youth initiatives conducted by Robokalam Technologies.
          </p>
        </div>

        {isAdmin && onNavigateToAdmin && (
          <button
            onClick={onNavigateToAdmin}
            className="px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            Manage Showcase Media
          </button>
        )}
      </div>

      {completedEvents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-sm font-semibold text-slate-800">No completed events in archive yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Once an event concludes, administrators can mark it completed and add event photographs and video links here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Event Selector Directory */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Completed Events ({completedEvents.length})
            </h3>

            <div className="space-y-2">
              {completedEvents.map((evt) => {
                const isSelected = evt.id === activeEventId;
                const countOfMedia = media.filter((m) => m.eventId === evt.id).length;

                return (
                  <button
                    key={evt.id}
                    onClick={() => setActiveEventId(evt.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-600'
                        : 'bg-white/60 hover:bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-mono">
                      <span>{evt.id}</span>
                      <span className="text-emerald-700 font-semibold uppercase">COMPLETED</span>
                    </div>

                    <h4 className={`text-sm font-bold leading-snug ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                      {evt.title}
                    </h4>

                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {evt.date}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-slate-400" />
                        {countOfMedia} media items
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Event Dossier & Media Gallery */}
          {currentEvent && (
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-xs">
              {/* Event Header Banner */}
              <div className="space-y-3 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span>ID: {currentEvent.id}</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentEvent.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-semibold">CONCLUDED</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                  {currentEvent.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Conducted: <strong>{currentEvent.date}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{currentEvent.venue}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                  {currentEvent.description}
                </p>
              </div>

              {/* Highlights & Takeaways */}
              {currentEvent.highlights && currentEvent.highlights.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Event Highlights & Milestones
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
                    <ul className="space-y-2 text-xs text-slate-700">
                      {currentEvent.highlights.map((item, index) => (
                        <li key={index} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Photo & Video Gallery */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                    Event Media Archive ({eventMediaList.length})
                  </h3>

                  {isAdmin && (
                    <button
                      onClick={() => setIsAddMediaOpen(true)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Photo / Video
                    </button>
                  )}
                </div>

                {eventMediaList.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-300 rounded-lg bg-slate-50/50 space-y-2">
                    <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-medium text-slate-700">
                      Official media attachment slot ready
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Real photographs provided for this event can be uploaded directly here or through the Admin Dashboard.
                    </p>
                    {isAdmin && (
                      <button
                        onClick={() => setIsAddMediaOpen(true)}
                        className="mt-2 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md cursor-pointer"
                      >
                        Upload Real Event Photo
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {eventMediaList.map((item) => (
                      <div
                        key={item.id}
                        className="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex flex-col justify-between"
                      >
                        {item.mediaType === 'video' ? (
                          <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
                            <button
                              onClick={() => setVideoModalUrl(item.fileUrl)}
                              className="w-12 h-12 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 cursor-pointer"
                            >
                              <Play className="w-5 h-5 ml-0.5 fill-current" />
                            </button>
                            <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded-xs">
                              VIDEO
                            </span>
                          </div>
                        ) : (
                          <div
                            onClick={() => item.fileUrl && setLightboxImage(item.fileUrl)}
                            className="cursor-pointer"
                          >
                            <ImageSlot
                              src={item.fileUrl}
                              alt={item.caption || 'Event photograph'}
                              aspectRatio="video"
                              label="Event Photo"
                              allowUpload={isAdmin}
                            />
                          </div>
                        )}

                        <div className="p-3 bg-white border-t border-slate-100">
                          <p className="text-xs text-slate-700 leading-snug font-medium">
                            {item.caption || 'Event archive photograph'}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Logged: {item.uploadedAt.split('T')[0]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-lg">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-white hover:text-slate-300 p-2 rounded-full bg-black/60 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Event enlarged"
              className="max-h-[85vh] w-auto object-contain mx-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Quick Add Media Modal for Admin */}
      <ImageUploadModal
        isOpen={isAddMediaOpen && isAdmin}
        onClose={() => setIsAddMediaOpen(false)}
        onImageUploaded={(url) => {
          if (currentEvent) {
            addMediaItem({
              eventId: currentEvent.id,
              mediaType: 'photo',
              fileUrl: url,
              caption: `Showcase photograph for ${currentEvent.title}`
            });
          }
        }}
        title={`Add Media to ${currentEvent?.id}`}
        subtitle="Attach the real photograph for this completed showcase event."
      />
    </div>
  );
};
