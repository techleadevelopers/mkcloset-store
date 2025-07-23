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
    <footer className="bg-white text-gray-800 py-16 border-t-2 border-gray-300"> {/* Fundo branco, texto geral em cinza escuro, adicionado borda superior leve */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand - Agora com a Logo */}
          <div>
            <Link href="/">
              <img
                src="/images/logo.jpg" // Usando a mesma logo do header
                alt="MKcloset Logo"
                className="h-[80px] w-auto mb-4 object-contain" // Ajuste o tamanho conforme a necessidade, 'w-auto' para manter proporção
              />
            </Link>
            <p className="text-gray-600 mb-4">
              Moda feminina premium com design contemporâneo e qualidade excepcional.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link href="/products/vestidos">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer">Vestido</span>
                </Link>
              </li>
              <li>
                <Link href="/products/jaquetas">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer">Jaqueta</span>
                </Link>
              </li>
              <li>
                <Link href="/products/saias">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer">Saia</span>
                </Link>
              </li>
              <li>
                <Link href="/products/shorts-saias">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer">Shorts saia</span>
                </Link>
              </li>
              <li>
                <Link href="/products/shorts">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer">Shorts</span>
                </Link>
              </li>
              <li>
                <Link href="/products/camisetas">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer">Camisetas</span>
                </Link>
              </li>
              <li>
                <Link href="/products/blusas">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer">Blusas</span>
                </Link>
              </li>
              <li>
                <Link href="/products/conjuntos">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer">Conjuntos</span>
                </Link>
              </li>
              <li>
                <Link href="/products/bodys">
                  <span className="hover:text-purple-600 transition-colors cursor-pointer">Body</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Atendimento</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-purple-600 transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Trocas e Devoluções</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Guia de Tamanhos</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Frete e Entrega</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-600 mb-4">Receba novidades e ofertas exclusivas</p>
            <form onSubmit={handleNewsletterSubmit} className="flex">
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-r-none bg-gray-100 border-gray-300 text-gray-800 focus:border-purple-400"
              />
              <Button
                type="submit"
                className="rounded-l-none bg-black text-white hover:bg-gray-800 transition-all duration-300"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">© 2024 MKcloset. Todos os direitos reservados.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {/* Imagem do Nubank adicionada aqui, substituindo as anteriores */}
            <img
              src="/images/nubank.jpg"
              alt="Nubank"
              className="h-11 object-contain" // Ajuste a altura conforme necessário
            />
          </div>
        </div>
      </div>
    </footer>
  );
}