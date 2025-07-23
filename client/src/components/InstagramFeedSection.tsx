// src/components/InstagramFeedSection.tsx
import { useEffect, useRef } from 'react';

export default function InstagramFeedSection() {
  const embedContainerRef = useRef<HTMLDivElement>(null);

  // Use useEffect para injetar a div de placeholder e o script do EmbedSocial uma vez
  useEffect(() => {
    // Verifica se o container existe e se o script do EmbedSocial já não foi adicionado
    if (embedContainerRef.current && !document.getElementById('EmbedSocialHashtagScript')) {
      // Cria a div de placeholder do EmbedSocial
      const embedDiv = document.createElement('div');
      embedDiv.className = 'embedsocial-hashtag';
      embedDiv.setAttribute('data-ref', '30a38ac065c37b4f25b9d7b92b88a7b91f1b780a');
      embedContainerRef.current.appendChild(embedDiv);

      // Injeta o script do EmbedSocial no head
      const script = document.createElement('script');
      script.id = 'EmbedSocialHashtagScript';
      script.src = 'https://embedsocial.com/cdn/ht.js';
      script.async = true; // Permite que o script carregue de forma assíncrona
      document.head.appendChild(script);
    }
  }, []); // O array vazio garante que o efeito roda apenas uma vez (no montagem)

  return (
    // A seção e o div interno são apenas para conter e centralizar o widget.
    // Você pode ajustar as classes de estilo (bg-gray-50, py-16, etc.) se não quiser
    // nenhum espaçamento ou cor de fundo padrão para esta seção.
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Este é o container onde o EmbedSocial vai renderizar o feed. */}
        {/* O JavaScript dentro do useEffect irá anexar a div '.embedsocial-hashtag' aqui. */}
       
      </div>
    </section>
  );
}