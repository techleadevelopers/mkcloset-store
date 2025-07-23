import { Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // Certifique-se de que cn está disponível se você usa shadcn/ui

export default function InstagramFeedSection() {
  // Mock data for Instagram images - replace with actual image URLs from your Instagram feed
  const instagramImages = [
    '/images/insta-placeholder-1.jpg', // Adicione suas próprias imagens aqui, ou use as que já possui
    '/images/insta-placeholder-2.jpg',
    '/images/insta-placeholder-3.jpg',
    '/images/insta-placeholder-4.jpg',
    '/images/insta-placeholder-5.jpg',
    '/images/insta-placeholder-6.jpg',
    '/images/insta-placeholder-7.jpg',
    '/images/insta-placeholder-8.jpg',
  ];

  // Adicione um link para o seu perfil do Instagram
  const instagramProfileUrl = "https://www.instagram.com/seuperfil"; // ATUALIZE COM SEU LINK REAL DO INSTAGRAM

  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8"> {/* Fundo cinza claro para contraste */}
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Siga-nos no Instagram
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Confira nossos looks mais recentes e inspirações de estilo!
        </p>

        {/* Grade de Imagens do Instagram */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
          {instagramImages.map((src, index) => (
            <div key={index} className="relative aspect-square overflow-hidden rounded-lg shadow-sm group">
              <img
                src={src}
                alt={`Instagram post ${index + 1}`}
                className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
              />
              {/* Overlay sutil ao passar o mouse */}
              <div className="absolute inset-0 bg-black bg-opacity-25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Instagram className="h-8 w-8 text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* Botão de Chamada para Ação */}
        <Button
          asChild // Usa `asChild` para que o Button renda como um link, se você estiver usando shadcn/ui
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 text-lg"
        >
          <a href={instagramProfileUrl} target="_blank" rel="noopener noreferrer">
            <Instagram className="inline-block h-5 w-5 mr-2" />
            @MKclosetOficial
          </a>
        </Button>
      </div>
    </section>
  );
}