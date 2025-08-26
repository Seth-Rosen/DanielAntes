# Daniel Antes Portfolio Website - Modular Static Site Builder

## Project Overview
Building a sophisticated, modular static website builder that starts as a portfolio for Daniel Antes (hardwood flooring artisan) but is architected to become a reusable platform for any creator/artisan.

## Core Vision
- **Static Site Generator**: Outputs deployable static sites (no server dependencies)
- **Visual Page Builder**: Drag-and-drop interface for content management
- **Modular Component System**: Reusable, configurable components
- **Industry Standard Architecture**: Modern patterns, best practices, extensible design

## Technical Architecture Decisions

### Static Site Generation Strategy
- **Build Process**: React components render to static HTML/CSS/JS
- **Content Management**: JSON-driven component configuration
- **Deployment**: Generated files can be deployed to any static host (Netlify, Vercel, AWS S3)
- **Admin Interface**: Separate admin app that generates/updates the static site

### Component Architecture
- **Component Library**: Modular React components with configuration schemas
- **Configuration Schema**: JSON schema for each component type
- **Page Builder**: Visual interface for arranging and configuring components
- **Rendering Engine**: Converts component configurations to static pages

### Authentication & Security
- **Static-First**: No server-side authentication needed for live site
- **Admin Protection**: Simple token-based authentication for the builder interface
- **Build-Time Security**: Admin interface separate from generated site

### Data Management
- **Configuration Storage**: JSON files for page/component configurations
- **Asset Management**: Organized file structure for images/media
- **Version Control**: Git-based workflow for changes and deployments

## User Workflow
1. **Admin Login**: Access the page builder interface
2. **Page Management**: Create/edit pages with drag-and-drop components
3. **Component Configuration**: Customize component properties visually
4. **Preview & Build**: Real-time preview, then generate static site
5. **Deploy**: Push generated files to hosting platform

## Initial Component Library
- **Hero Section**: Configurable background, text, CTA
- **Gallery Component**: Smart filtering, project grouping, slideshow
- **Carousel Component**: Horizontal scrolling, auto-cycling, hover effects
- **Text Block**: Rich text with formatting options
- **Contact Form**: Static form with configurable fields
- **Navigation**: Responsive menu with customizable links

## Technical Stack
- **Core Framework**: Puck.js (React-based visual builder)
- **Frontend**: React + TypeScript + Tailwind CSS
- **Build System**: Vite for development, Puck's static export system
- **Component Architecture**: Puck config-driven modular components
- **Admin Interface**: Puck's built-in visual editor with custom components
- **Authentication**: Simple token-based protection for admin routes
- **Deployment**: Static files export compatible with any hosting platform
- **Asset Management**: Organized file structure with optimized image handling

## Development Phases
1. **Phase 1**: Core component library and basic page builder
2. **Phase 2**: Advanced components and Daniel's portfolio implementation
3. **Phase 3**: Multi-tenant capability and open-source release

## User Preferences
- Prioritize modularity and extensibility
- Industry-standard coding practices
- Efficient, reusable architecture
- Static deployment compatibility
- Visual, non-technical user interface

## Recent Changes
- **August 26, 2025**: Fixed critical authentication issues
  - Resolved token passing between frontend and backend
  - Fixed image upload functionality with proper auth headers
  - Enabled project creation and management
- **August 26, 2025**: Enhanced page builder functionality
  - Added existing page editing capability through admin dashboard
  - Created default homepage with full component structure
  - Resolved Puck.js duplicate element issues
  - Implemented visual page management cards
- **August 26, 2025**: Completed core admin functionality
  - Working image upload with project association and tagging
  - Functional project management system
  - Page creation, editing, and publishing workflow
  - Clean, professional admin interface
