import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      toast({
        title: "Inscrição realizada!",
        description: "Você receberá nossas novidades em breve.",
      });
      setEmail('');
    }
  };

  return (
    <footer className="bg-white text-gray-800 py-12 sm:py-16 lg:py-20 border-t-2 border-gray-300"> {/* Fundo branco, texto geral em cinza escuro, adicionado borda superior leve */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand - Agora com a Logo */}
          <div className="text-center sm:text-left mb-6 sm:mb-0">
            <Link href="/">
              <img
                src="/images/logo.jpg" // Usando a mesma logo do header
                alt="MKcloset Logo"
                className="h-16 sm:h-20 lg:h-[80px] w-auto mb-3 sm:mb-4 object-contain mx-auto sm:mx-0" // Ajuste o tamanho conforme a necessidade, 'w-auto' para manter proporção
              />
            </Link>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed px-4 sm:px-0">
              Moda feminina premium com design contemporâneo e qualidade excepcional.
            </p>
            <div className="flex justify-center sm:justify-start space-x-3 sm:space-x-4">
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                <i className="fab fa-instagram text-lg sm:text-xl"></i>
              </a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                <i className="fab fa-facebook text-lg sm:text-xl"></i>
              </a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                <i className="fab fa-twitter text-lg sm:text-xl"></i>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6 sm:mb-0">
            <h4 className="font-semibold mb-3 sm:mb-4 text-center sm:text-left text-base sm:text-lg">Categorias</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-600 text-center sm:text-left">
              <li>
                <Link href="/products/vestidos">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer text-sm sm:text-base">Vestido</span>
                </Link>
              </li>
              <li>
                <Link href="/products/jaquetas">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer text-sm sm:text-base">Jaqueta</span>
                </Link>
              </li>
              <li>
                <Link href="/products/saias">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer text-sm sm:text-base">Saia</span>
                </Link>
              </li>
              <li>
                <Link href="/products/shorts-saias">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer text-sm sm:text-base">Shorts saia</span>
                </Link>
              </li>
              <li>
                <Link href="/products/shorts">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer text-sm sm:text-base">Shorts</span>
                </Link>
              </li>
              <li>
                <Link href="/products/camisetas">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer text-sm sm:text-base">Camisetas</span>
                </Link>
              </li>
              <li>
                <Link href="/products/blusas">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer text-sm sm:text-base">Blusas</span>
                </Link>
              </li>
              <li>
                <Link href="/products/conjuntos">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer text-sm sm:text-base">Conjuntos</span>
                </Link>
              </li>
              <li>
                <Link href="/products/bodys">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer text-sm sm:text-base">Body</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="mb-6 sm:mb-0">
            <h4 className="font-semibold mb-3 sm:mb-4 text-center sm:text-left text-base sm:text-lg">Atendimento</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-600 text-center sm:text-left">
              <li><a href="#" className="hover:text-purple-600 transition-colors text-sm sm:text-base">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors text-sm sm:text-base">Trocas e Devoluções</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors text-sm sm:text-base">Guia de Tamanhos</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors text-sm sm:text-base">Frete e Entrega</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="font-semibold mb-3 sm:mb-4 text-center sm:text-left text-base sm:text-lg">Newsletter</h4>
            <p className="text-gray-600 mb-3 sm:mb-4 text-center sm:text-left text-sm sm:text-base px-4 sm:px-0">
              Receba novidades e ofertas exclusivas
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-0 px-4 sm:px-0">
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 sm:rounded-r-none bg-gray-100 border-gray-300 text-gray-800 focus:border-purple-400 text-sm sm:text-base h-10 sm:h-auto"
              />
              <Button
                type="submit"
                className="sm:rounded-l-none bg-black text-white hover:bg-gray-800 transition-all duration-300 h-10 sm:h-auto text-sm sm:text-base"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <p className="text-gray-600 text-xs sm:text-sm text-center sm:text-left">
            © 2024 MKcloset. Todos os direitos reservados.
          </p>
          <div className="flex items-center justify-center">
            {/* Imagem do Nubank adicionada aqui, substituindo as anteriores */}
            <img
              src="/images/nubank.jpg"
              alt="Nubank"
              className="h-8 sm:h-10 lg:h-11 object-contain" // Ajuste a altura conforme necessário
            />
          </div>
        </div>
      </div>
    </footer>
  );
}