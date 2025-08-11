# I-MELT Operator Web UI

## Overview

A real-time industrial dashboard for electric arc furnace operations, built with React 18 and TypeScript. The application displays heat data, material composition, stage timelines, and AI-powered insights for steel production monitoring. Features a minimalist design following Cone Red's brand guidelines with black, white, and signal-red color scheme.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Bundler**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom brand tokens (Cone Red design system)
- **Component Library**: Radix UI components for accessible, headless UI primitives
- **State Management**: Redux Toolkit for predictable state management
- **Data Fetching**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Real-time Communication**: WebSocket server for live furnace data updates
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL store
- **API**: RESTful endpoints with WebSocket integration

### UI/UX Design Patterns
- **Grid Layout**: 12-column CSS Grid system for responsive dashboard layout
- **Component Structure**: Modular dashboard components (HeatHeaderCard, ChargeBucketsMatrix, StageTimeline, etc.)
- **Data Visualization**: Recharts for interactive charts and radar plots
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Brand Implementation**: Triangle motifs and Cone Red color palette throughout

### Data Architecture
- **Schema Design**: Relational structure with heats, buckets, stages, additives, and chemistry tables
- **Real-time Updates**: WebSocket messages for live data synchronization
- **Type Safety**: Shared TypeScript interfaces between client and server
- **Data Flow**: Redux actions triggered by WebSocket events
- **AI Integration**: OpenRouter API with fallback responses for steel production insights and recommendations
- **Deterministic Insights**: Physics simulation state mapped to instant AI insights (LLM-off by default)
- **ROI Calculator**: Live savings calculation with CFO-focused €/month projections and PDF report generation

### Development Workflow
- **Build Process**: Separate client and server builds with shared type definitions
- **Development Server**: Hot module replacement with Vite development server
- **Database Migrations**: Drizzle Kit for schema management and migrations

## External Dependencies

### Database & Storage
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with schema validation
- **connect-pg-simple**: PostgreSQL session store for Express

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Headless component library for accessibility and behavior
- **Recharts**: Composable charting library for data visualization
- **Lucide React**: Icon library for consistent iconography

### Development & Build
- **Vite**: Fast build tool with React plugin and runtime error overlay
- **tsx**: TypeScript execution engine for development server
- **esbuild**: Fast JavaScript bundler for production builds

### Communication & AI Integration
- **WebSocket (ws)**: Real-time bidirectional communication for live data
- **TanStack React Query**: Server state management and caching
- **Redux Toolkit**: Predictable state container with modern patterns
- **OpenRouter API**: AI-powered chat and insights using Claude 3.5 Sonnet for steel production analysis

### Utilities
- **date-fns**: Date manipulation and formatting
- **clsx/tailwind-merge**: Conditional CSS class utilities
- **zod**: Runtime type validation and schema parsing
- **nanoid**: Unique ID generation for sessions and components