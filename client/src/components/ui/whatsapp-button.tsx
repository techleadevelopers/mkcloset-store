// src/components/ui/whatsapp-button.tsx

import { useState, useEffect } from 'react';
// Não precisamos de MessageCircle ou Phone se não forem usados em outras partes.
// Se não usar em mais nenhum lugar, pode remover essas importações.
import { MessageCircle, Phone } from 'lucide-react'; 

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  className?: string;
}

export default function WhatsAppButton({ 
  phoneNumber = "5519997023214", 
  message = "Olá! Gostaria de saber mais sobre os produtos da MKcloset.",
  className = ""
}: WhatsAppButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    const pulseTimer = setTimeout(() => setIsPulsing(false), 10000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(pulseTimer);
    };
  }, []);

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div 
        className={`fixed bottom-6 right-6 z-50 ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Glow Effect */}
        <div className={`absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 transition-all duration-500 ${isHovered ? 'scale-150 opacity-50' : 'scale-100'} ${isPulsing ? 'animate-pulse' : ''}`} />
        
        {/* Ripple Effects */}
        <div className={`absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20 ${isHovered ? 'scale-110' : 'scale-100'}`} />
        <div className={`absolute inset-0 bg-green-400 rounded-full animate-ping opacity-10 animation-delay-1000 ${isHovered ? 'scale-125' : 'scale-100'}`} />
        
        {/* Main Button */}
        <button
          onClick={handleClick}
          className={`
            relative w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 
            hover:from-green-400 hover:to-green-500 
            text-white rounded-full shadow-2xl 
            transform transition-all duration-300 ease-out
            hover:scale-110 hover:-translate-y-1
            active:scale-95 active:translate-y-0
            group cursor-pointer
            ${isHovered ? 'shadow-green-500/50' : 'shadow-green-600/30'}
          `}
          aria-label="Contato via WhatsApp"
        >
          {/* Button Content - AGORA COM A IMAGEM /images/frente.jpg */}
          <div className="relative flex items-center justify-center w-16 h-16 overflow-hidden rounded-full"> {/* Adicionado overflow-hidden e rounded-full aqui */}
            <img 
              src="/images/whatssap.png" // <-- MUDANÇA: O caminho da sua imagem real
              alt="Imagem do Produto"
              className="w-full h-full object-cover" // <-- MUDANÇA: w-full h-full e object-cover para preencher o círculo
            />
            
            {/* Sparkle Effects */}
            <div className={`absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full opacity-0 transition-all duration-300 ${isHovered ? 'opacity-100 animate-bounce' : ''}`} />
            <div className={`absolute -bottom-1 -left-1 w-2 h-2 bg-blue-300 rounded-full opacity-0 transition-all duration-500 ${isHovered ? 'opacity-100 animate-ping' : ''}`} />
          </div>
          
          {/* Inner Glow */}
          <div className={`absolute inset-1 bg-white rounded-full opacity-0 transition-all duration-300 ${isHovered ? 'opacity-20' : ''}`} />
        </button>

        {/* Tooltip */}
        <div className={`
          absolute bottom-full right-0 mb-3 px-4 py-2 
          bg-gray-900 text-white text-sm rounded-xl shadow-xl
          whitespace-nowrap pointer-events-none
          transform transition-all duration-300 ease-out
          ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}>
          <div className="relative">
            Fale conosco no WhatsApp
            {/* Tooltip Arrow */}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      </div>

      {/* Mobile Notification Bubble */}
      <div className={`
        fixed top-20 right-4 z-40 max-w-xs
        transform transition-all duration-700 ease-out
        ${isVisible && isPulsing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        sm:hidden
      `}>
        <div className="bg-white rounded-xl shadow-2xl familiarize border border-gray-100 p-4 relative">
          {/* Close Button */}
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 text-white rounded-full text-xs hover:bg-gray-700 transition-colors"
          >
            ×
          </button>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"> {/* Adicionado overflow-hidden aqui */}
              <img 
                src="/images/whatssap.png" // <-- MUDANÇA: O caminho da sua imagem real para o bubble
                alt="Imagem do Produto"
                className="w-full h-full object-cover" // <-- MUDANÇA: w-full h-full e object-cover
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 mb-1">MKcloset</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Precisa de ajuda? Fale conosco no WhatsApp! 💬
              </p>
              <button 
                onClick={handleClick}
                className="mt-2 text-xs bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition-colors"
              >
                Iniciar conversa
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}