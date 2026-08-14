import React from 'react';
import { Send, MapPin, Mail, Phone, Globe } from 'lucide-react';

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent!');
  };

  const info = [
    { icon: <Mail  size={13} />, label: 'Email',      val: 'civiladagegce@gmail.com' },
    { icon: <Phone size={13} />, label: 'Phone',      val: '+91 81225 78554' },
    { icon: <Globe size={13} />, label: 'Social',     val: '@adage_gceerode' },
    { icon: <MapPin size={13}/>, label: 'Department', val: 'Civil Block, GCE Erode, Suriyampalayam — 638 316' },
  ];

  return (
    <div className="min-h-screen py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Title */}
        <div className="mb-10 sm:mb-16 animate-fade-in-up">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <span className="w-6 sm:w-8 h-px bg-[#C8922A]" />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em] text-[#C8922A]">Contact</span>
          </div>
          <h1 className="font-cinzel font-black text-3xl sm:text-4xl md:text-5xl text-[#EDEBE6] uppercase tracking-wide">
            Get In Touch
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16">

          {/* Form */}
          <div className="animate-fade-in-up">
            <h2 className="font-cinzel font-bold text-base sm:text-lg text-[#EDEBE6] uppercase tracking-wider mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-white/[0.06]">
              Send a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="section-label block mb-2">Name</label>
                  <input type="text" required placeholder="Your name" className="civil-input" />
                </div>
                <div>
                  <label className="section-label block mb-2">Email</label>
                  <input type="email" required placeholder="your@email.com" className="civil-input" />
                </div>
              </div>
              <div>
                <label className="section-label block mb-2">Subject</label>
                <input type="text" required placeholder="Event query" className="civil-input" />
              </div>
              <div>
                <label className="section-label block mb-2">Message</label>
                <textarea rows={5} required placeholder="Your message..." className="civil-input resize-none" />
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-4">
                Send Message <Send size={13} />
              </button>
            </form>
          </div>

          {/* Info column */}
          <div className="animate-fade-in-up anim-delay-200">
            <h2 className="font-cinzel font-bold text-base sm:text-lg text-[#EDEBE6] uppercase tracking-wider mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-white/[0.06]">
              Our Location
            </h2>

            <div className="h-44 sm:h-52 border border-white/[0.06] overflow-hidden mb-6 sm:mb-8 relative group">
              <iframe
                title="Venue Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3910.3702587508753!2d77.67876877508535!3d11.45524318873722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba9680a653bb7e5%3A0xbefbe4fd0a790589!2sGovernment%20College%20of%20Engineering%2C%20Erode!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%" height="100%" className="border-0 grayscale opacity-50 hover:opacity-80 transition-opacity"
                allowFullScreen loading="lazy"
              />
              <a
                href="https://maps.app.goo.gl/dpZ1Amf1r3dFJqK29"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-10 flex items-end justify-end p-3 bg-gradient-to-t from-black/80 via-transparent to-transparent text-xs text-[#C8922A] font-semibold hover:underline"
              >
                Open Google Maps ↗
              </a>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {info.map((item, i) => (
                <div key={i} className="flex items-start gap-3 sm:gap-4 py-3 sm:py-4">
                  <div className="text-[#C8922A] mt-0.5 flex-shrink-0">{item.icon}</div>
                  <div>
                    <p className="section-label mb-1">{item.label}</p>
                    {item.label === 'Department' ? (
                      <a
                        href="https://maps.app.goo.gl/dpZ1Amf1r3dFJqK29"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-gray-400 hover:text-[#C8922A] transition-colors inline-flex items-center gap-1"
                      >
                        {item.val} ↗
                      </a>
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-400">{item.val}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
