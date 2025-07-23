import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function Header() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isCartOpen, isMobileMenuOpen, toggleCart, toggleMobileMenu } = useUIStore();

  const navigation = [
    { name: 'Novidades', href: '/products?featured=true' },
    { name: 'Conjuntos', href: '/products/conjuntos' },
    { name: 'Vestidos', href: '/products/vestidos' },
    { name: 'Saias', href: '/products/saias' },
    { name: 'Top', href: '/products/tops' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-8">
        <div className="flex justify-between items-center h-20"> {/* Ajuste na altura do header */}
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <img
                src="/images/logo.jpg"
                className="h-[120px] w-[120px] mr-10 object-contain" // Definindo altura e largura
                alt="Logo"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <span className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium cursor-pointer">
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pr-10"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => {
                const query = prompt('Buscar produtos:');
                if (query?.trim()) {
                  setLocation(`/products?search=${encodeURIComponent(query.trim())}`);
                }
              }}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Login/Register */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white">
                  Cadastrar
                </Button>
              </Link>
            </div>

            {/* Wishlist */}
            <Link href="/wishlist">
              <Button variant="ghost" size="sm" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={toggleCart}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "max-h-96 border-t border-gray-100" : "max-h-0"
        )}>
          <div className="py-4 space-y-2">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <div
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors cursor-pointer"
                  onClick={() => toggleMobileMenu()}
                >
                  {item.name}
                </div>
              </Link>
            ))}
            
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-4 py-2">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}