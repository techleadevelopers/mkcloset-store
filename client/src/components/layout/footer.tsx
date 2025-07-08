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
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-gradient-purple mb-4">
              MKcloset
            </h3>
            <p className="text-gray-400 mb-4">
              Moda feminina premium com design contemporâneo e qualidade excepcional.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/products/vestidos">
                  <span className="hover:text-white transition-colors cursor-pointer">Vestidos</span>
                </Link>
              </li>
              <li>
                <Link href="/products/casual">
                  <span className="hover:text-white transition-colors cursor-pointer">Blusas</span>
                </Link>
              </li>
              <li>
                <Link href="/products/casual">
                  <span className="hover:text-white transition-colors cursor-pointer">Calças</span>
                </Link>
              </li>
              <li>
                <Link href="/products/acessorios">
                  <span className="hover:text-white transition-colors cursor-pointer">Acessórios</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Atendimento</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Trocas e Devoluções</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Guia de Tamanhos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Frete e Entrega</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4">Receba novidades e ofertas exclusivas</p>
            <form onSubmit={handleNewsletterSubmit} className="flex">
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-r-none bg-gray-800 border-gray-700 focus:border-purple-400"
              />
              <Button
                type="submit"
                className="rounded-l-none gradient-purple hover:shadow-lg transition-all duration-300"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 MKcloset. Todos os direitos reservados.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/124px-PayPal.svg.png" alt="PayPal" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/2560px-Mastercard-logo.svg.png" alt="Mastercard" className="h-8" />
          </div>
        </div>
      </div>
    </footer>
  );
}
