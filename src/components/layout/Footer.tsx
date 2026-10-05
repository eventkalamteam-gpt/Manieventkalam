import React from 'react';
import { Mail, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { FOUNDERS_DATA } from '../../data/initialData';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Brand & Purpose */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                EK
              </span>
              <span className="text-xl font-bold tracking-tight text-white">EventKalam</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              The official event management and showcase platform dedicated to workshops, innovation meetups, and youth skill building.
            </p>
            <div className="pt-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                Associated Organization
              </span>
              <p className="text-xs font-medium text-slate-200">
                Robokalam Technologies
              </p>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('events')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Browse Events
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('showcase')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Past Events Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About & Leadership
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Headquarters */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Headquarters
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-300 font-medium block">Robokalam</strong>
                  Hanumkonda, Telangana – 506001
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <a
                  href="mailto:robokalam@gmail.com"
                  className="hover:text-white transition-colors text-slate-300 underline underline-offset-2"
                >
                  robokalam@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Social Media Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Connect With Robokalam
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Follow our community initiatives, event live updates, and student achievements:
            </p>
            <div className="flex flex-col space-y-2 text-xs">
              <a
                href={FOUNDERS_DATA.company.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <span>X / Twitter</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href={FOUNDERS_DATA.company.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <span>Facebook</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href={FOUNDERS_DATA.company.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <span>Instagram</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} EventKalam. A platform by Robokalam Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Hanumkonda, Telangana</span>
            <span aria-hidden="true">·</span>
            <span>PIN: 506001</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
