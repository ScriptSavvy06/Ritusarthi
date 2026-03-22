import React from 'react';
import { MessageCircle } from 'lucide-react';
import {
  CONTACT_PHONE_WHATSAPP,
  WHATSAPP_DEFAULT_MESSAGE
} from '../constants/site';

const WhatsAppButton = () => {
  return (
    <a
      href={`https://wa.me/${CONTACT_PHONE_WHATSAPP}?text=${encodeURIComponent(
        WHATSAPP_DEFAULT_MESSAGE
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full bg-[#25D366] p-4 text-white shadow-lg transition-transform hover:scale-110"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle size={32} />
    </a>
  );
};

export default WhatsAppButton;
