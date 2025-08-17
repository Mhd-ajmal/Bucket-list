# Buked List - Personal Wishlist PWA

## Overview

Buked List is a Progressive Web App (PWA) designed for managing personal wishlists with offline functionality. The application is built as a full-stack TypeScript project featuring a React frontend with shadcn/ui components, an Express backend, and local IndexedDB storage via Dexie. The app supports customizable grid views, categorized items with images, theme switching, and comprehensive data management features including import/export capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite for build tooling and development server
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API for global state (theme, wishlist data) combined with TanStack Query for server state management
- **Styling**: Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes

### Backend Architecture
- **Server**: Express.js with TypeScript, serving both API routes and static assets
- **Development Setup**: Vite middleware integration for hot module replacement during development
- **Session Management**: Basic session handling with connect-pg-simple (though currently using in-memory storage)
- **Database Integration**: Configured for PostgreSQL via Drizzle ORM but currently using in-memory storage

### Data Storage Solutions
- **Client-side Storage**: Dexie (IndexedDB wrapper) for offline-first data persistence
  - Categories table with emoji support and default categories
  - Wishlist items with images, pricing, notes, and categorization
  - App settings for user preferences (theme, grid view, selected category)
- **Server-side Storage**: In-memory storage interface with provision for database migration
- **Database Schema**: Shared Zod schemas between client and server for type safety

### PWA Features
- **Service Worker**: Custom service worker for offline functionality and caching
- **Web App Manifest**: Full PWA configuration with icons, theme colors, and display settings
- **Offline Support**: Complete offline functionality with local data storage and sync capabilities

### Authentication and Authorization
- **Current State**: Basic user schema defined but not actively implemented
- **Storage Interface**: Prepared for user management with CRUD operations
- **Session Handling**: Infrastructure in place for session-based authentication

### Image Handling
- **Storage**: Support for both Blob storage (local files) and URL references (external images)
- **Upload**: File input with preview functionality for image attachments
- **Display**: Responsive image rendering with fallback support

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver for serverless environments
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **dexie**: IndexedDB wrapper for client-side data persistence
- **@tanstack/react-query**: Server state management and caching

### UI and Styling
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for component styling
- **lucide-react**: Consistent icon library

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **wouter**: Lightweight React router
- **react-hook-form**: Form state management with @hookform/resolvers for validation

### Service Worker
- Custom service worker implementation for offline caching and PWA functionality, with manual registration and update handling