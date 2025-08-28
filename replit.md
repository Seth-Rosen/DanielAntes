# Daniel Antes Portfolio Website - Modular Static Site Builder

## Project Overview
Building a sophisticated, modular static website builder that starts as a portfolio for Daniel Antes (hardwood flooring artisan) but is architected to become a reusable platform for any creator/artisan.

## Core Vision
- **Static Site Generator**: Outputs deployable static sites (no server dependencies)
- **Visual Page Builder**: Drag-and-drop interface for content management
- **Modular Component System**: Reusable, configurable components
- **Industry Standard Architecture**: Modern patterns, best practices, extensible design

## Technical Architecture Decisions

### Revolutionary Static-First Strategy
- **Direct Puck Data Loading**: Live site loads Puck JSON and renders with same React components as editor
- **Admin Interface Integration**: Admin panel lives at /admin on same domain as live site
- **No HTML Generation**: Eliminates duplication by using same components for editing and viewing
- **Storage Abstraction**: Local files for development, hosting provider APIs for production

### Component Architecture
- **Component Library**: Modular React components with configuration schemas
- **Configuration Schema**: JSON schema for each component type
- **Page Builder**: Visual interface for arranging and configuring components
- **Rendering Engine**: Converts component configurations to static pages

### Authentication & Security
- **Client-Side Only**: No server infrastructure required anywhere
- **Admin Protection**: Simple password protection for /admin routes
- **Integrated Security**: Admin interface secured within the static site itself

### Data Management
- **Puck Data Storage**: Single JSON source for page configurations
- **No Draft Storage**: Direct edit-to-publish workflow
- **Asset Management**: Images and media handled by hosting provider
- **Version Control**: Git-based workflow for hosting provider integration

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
- **August 27, 2025**: Revolutionary Architecture Redesign
  - Designed static-first architecture eliminating server dependency
  - Planned direct Puck data loading for live site rendering
  - Integrated admin interface within static site at /admin route
  - Simplified to edit-to-publish workflow with no draft storage
- **August 26, 2025**: Completed server-based foundation
  - Working Puck.js visual editor with authentication
  - Functional project and image management systems
  - Page creation, editing, and publishing workflow
  - Professional admin interface (to be converted to static)
