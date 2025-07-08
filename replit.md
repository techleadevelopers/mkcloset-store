# replit.md

## Overview

This is a full-stack e-commerce application built as a React/TypeScript frontend with an Express.js backend. The application is designed for a fashion retail store called "MKcloset" specializing in women's clothing. It features a modern, responsive design with a black and gray monochromatic color scheme and includes shopping cart functionality, wishlist management, product browsing, and interface-only checkout (no payment processing).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: 
  - Zustand for UI state (cart open/close, mobile menu)
  - React Query (TanStack Query) for server state management
  - React Context for cart and wishlist providers
- **Routing**: Wouter (lightweight client-side routing)
- **Styling**: Tailwind CSS with custom CSS variables for theming

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with memory store
- **Payment Processing**: Stripe integration
- **Build Tool**: esbuild for production builds

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Tables**: categories, products, cart_items, wishlist_items, orders, order_items
- **Schema Location**: `shared/schema.ts` for type safety across frontend/backend

## Key Components

### Frontend Components
1. **Layout Components**
   - Header with navigation, search, cart, and wishlist
   - Footer with newsletter signup and links
   - Responsive mobile menu

2. **Product Components**
   - Product cards with hover effects and quick actions
   - Product detail pages with image galleries
   - Category filtering and search functionality

3. **Shopping Features**
   - Shopping cart sidebar with item management
   - Wishlist functionality with heart icons
   - Checkout form with Stripe Elements integration

4. **UI Components**
   - Complete shadcn/ui component library
   - Custom styled components with purple/pink theme
   - Responsive design with mobile-first approach

### Backend Services
1. **Product Management**
   - CRUD operations for products and categories
   - Search functionality across products
   - Featured products endpoint

2. **Shopping Cart**
   - Session-based cart management
   - Add/update/remove cart items
   - Size and color variant support

3. **Order Processing**
   - Stripe payment intent creation
   - Order creation and status management
   - Integration with cart clearing

## Data Flow

1. **Product Browsing**: Frontend uses local mock data from `lib/mock-data.ts` with filtering and search
2. **Cart Management**: localStorage-based cart with React context for state management and real-time UI updates
3. **Wishlist**: localStorage-based wishlist with React context for persistence and synchronization
4. **Checkout Process**: 
   - Frontend-only interface simulation
   - Form validation and user data collection
   - Mock payment processing interface
   - Cart clearing with success feedback

## External Dependencies

### Frontend Dependencies
- React Query for server state management
- Stripe React components for payment processing
- Radix UI primitives for accessible components
- Tailwind CSS for styling
- Wouter for routing

### Backend Dependencies
- Drizzle ORM for database operations
- Stripe for payment processing
- Express sessions for state management
- Neon Database for PostgreSQL hosting

### Development Tools
- Vite with React plugin
- TypeScript for type safety
- ESBuild for backend bundling
- Replit-specific plugins for development environment

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- tsx for running TypeScript backend in development
- Shared types between frontend and backend via `shared/` directory

### Production Build
- Frontend: Vite build outputs to `dist/public`
- Backend: esbuild bundles server to `dist/index.js`
- Static file serving from Express in production

### Environment Configuration
- Database URL for PostgreSQL connection
- Stripe keys (public and secret)
- Session secret for security

## Changelog
- July 08, 2025. Initial setup with pink/lilac color scheme
- July 08, 2025. Complete color scheme redesign from pink/lilac to black and gray monochromatic palette. Updated all pages including login, register, checkout, wishlist, order-success, and header components to use the new color scheme.
- July 08, 2025. Integrated ultra-modern WhatsApp button with multiple visual effects:
  - Floating button with glow effects, ripples, and pulsing animations
  - Hover effects with scale transformation and dynamic shadows
  - Mobile notification bubble for better mobile UX
  - Tooltip with smooth animations
  - Sparkle effects and gradient backgrounds
  - Added to all main pages (home, products, checkout, product-detail)
- July 08, 2025. Complete migration to frontend-only architecture:
  - Replaced all backend API calls with localStorage-based mock data system
  - Cart and wishlist now use only frontend state management with persistence
  - Added realistic loading delays (800ms for cart, 300ms for wishlist) 
  - Enhanced cart notification system with product preview and animations
  - Implemented comprehensive checkout flow integrated with cart
  - All data operations now independent of backend server

## User Preferences

Preferred communication style: Simple, everyday language.
User language: Portuguese
Design preference: Black and gray color scheme, no purple or lilac colors
Focus: Interface design only, no payment processing functionality