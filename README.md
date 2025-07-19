# JSON Schema Builder Pro

A professional Next.js application for building, managing, and exporting JSON schemas with AI assistance and real-time collaboration features.

## 🚀 Features

### Core Functionality
- **Visual Schema Builder**: Interactive drag-and-drop interface for creating complex JSON schemas
- **AI-Powered Generation**: Generate schemas from natural language descriptions using Google's Gemini AI
- **Multi-Format Export**: Export to JSON Schema, TypeScript interfaces, and Python classes
- **Schema History**: Track changes with version control and rollback capabilities

### Authentication & Security
- **Multi-Provider Auth**: Google OAuth and email-based authentication
- **Session Management**: JWT-based sessions with MongoDB adapter

### Data Management
- **Cloud Storage**: MongoDB integration for schema persistence
- **User Isolation**: Schemas are scoped to authenticated users

## 🏗️ Architecture

### System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js App Router]
        B[React Components]
        C[Tailwind CSS + shadcn/ui]
    end
    
    subgraph "API Layer"
        D[Next.js API Routes]
        E[NextAuth.js]
        F[Google Gemini AI]
    end
    
    subgraph "Data Layer"
        G[MongoDB Atlas]
        H[Schema Collections]
        I[User Sessions]
    end
    
    A --> B
    B --> D
    D --> E
    D --> F
    D --> G
    G --> H
    G --> I
    E --> G
```

### Component Architecture

```mermaid
graph LR
    subgraph "Schema Builder"
        A[SchemaBuilder.tsx]
        B[FieldRow.tsx]
        C[NestedFields.tsx]
        D[SchemaExport.tsx]
        E[SchemaHistory.tsx]
        F[AIAssistant.tsx]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    B --> C
```

## 📊 Data Schema

### Core Data Types

The application uses a flexible schema field structure:

```mermaid
erDiagram
    SchemaField {
        string id PK
        string name
        enum type
        any value
        SchemaField[] children
        string[] enumValues
        string arrayItemType
        boolean required
        string description
        number minLength
        number maxLength
        number min
        number max
        string pattern
    }
    
    SavedSchema {
        string _id PK
        string name
        SchemaField[] schema
        string userEmail FK
        string createdAt
        string updatedAt
    }
    
    HistoryEntry {
        string id PK
        Date timestamp
        SchemaField[] fields
        string action
    }
    
    SavedSchema ||--o{ SchemaField : contains
    HistoryEntry ||--o{ SchemaField : tracks
```

### Database Collections

```mermaid
erDiagram
    schemas {
        ObjectId _id PK
        string name
        object schema
        string userEmail
        Date createdAt
        Date updatedAt
    }
    
    users {
        ObjectId _id PK
        string name
        string email
        string image
        Date emailVerified
    }
    
    accounts {
        ObjectId _id PK
        ObjectId userId FK
        string type
        string provider
        string providerAccountId
    }
    
    sessions {
        ObjectId _id PK
        string sessionToken
        ObjectId userId FK
        Date expires
    }
    
    users ||--o{ schemas : owns
    users ||--o{ accounts : has
    users ||--o{ sessions : has
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14.2.8 with App Router
- **UI Library**: React 18.3.1 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: Framer Motion + GSAP

### Backend
- **API**: Next.js API Routes with TypeScript
- **Authentication**: NextAuth.js v4.24.7
- **Database**: MongoDB with official driver
- **AI Integration**: Google Generative AI (Gemini)

### Development Tools
- **Validation**: Zod for schema validation
- **Forms**: React Hook Form with Radix UI
- **Linting**: ESLint with Next.js configuration

## 🚦 Getting Started

### Prerequisites
- Node.js 18 or higher
- MongoDB Atlas account
- Google Cloud Console project (for OAuth)
- Google AI Studio API key (for Gemini)

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-characters
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (Optional)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com

# AI Integration
GEMINI_API_KEY=your-gemini-api-key
```

### Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/Priyanshuthapliyal2005/jsonAi-main.git
cd jsonAi-main
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Run development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

5. **Build for production**
```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth.js endpoints
│   │   ├── schemas/       # Schema CRUD operations
│   │   └── ai/           # AI generation endpoints
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Protected dashboard pages
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── schema-builder/   # Core schema building components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   └── auth/            # Authentication components
├── lib/                 # Utility libraries
│   ├── auth.ts          # NextAuth configuration
│   ├── mongodb.ts       # Database connection
│   ├── utils.ts         # Helper functions
│   └── validations.ts   # Zod validation schemas
├── types/               # TypeScript definitions
│   ├── schema.ts        # Schema type definitions
│   └── auth.ts          # Authentication types
├── public/             # Static assets
│   ├── icons/          # Application icons
│   └── images/         # Images and graphics
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
├── next.config.js      # Next.js configuration
├── package.json        # Dependencies and scripts
├── tailwind.config.ts  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## 🔧 API Endpoints

### Authentication
- `GET/POST /api/auth/*` - NextAuth.js authentication endpoints

### Schema Management
- `GET /api/schemas` - Fetch user schemas
- `POST /api/schemas` - Create new schema
- `PUT /api/schemas/[id]` - Update existing schema
- `DELETE /api/schemas/[id]` - Delete schema

### AI Generation
- `POST /api/ai/generate-schema` - Generate schema from natural language description

## 🎨 UI Components

The application uses a comprehensive design system built on Tailwind CSS and shadcn/ui:

### Key Features
- **Dark/Light Mode**: System-aware theme switching with manual override
- **Responsive Design**: Mobile-first approach with consistent breakpoints
- **Accessibility**: ARIA-compliant components with full keyboard navigation
- **Animations**: Smooth transitions and micro-interactions using Framer Motion

### Component Library
- Form components (Input, Select, Checkbox, etc.)
- Layout components (Card, Dialog, Sheet, etc.)
- Navigation components (Breadcrumbs, Pagination, etc.)
- Feedback components (Toast, Alert, Loading states, etc.)

## 🔐 Security Features

- **Authentication**: Multi-provider OAuth with secure session management
- **Authorization**: User-scoped data access with JWT validation
- **Input Validation**: Comprehensive Zod schemas for all API endpoints
- **CSRF Protection**: Built-in NextAuth.js security measures
- **Environment Security**: Secure handling of sensitive configuration

## 📈 Performance Optimizations

- **Server-Side Rendering**: Next.js App Router with streaming and suspense
- **Code Splitting**: Automatic component-level and route-level splitting
- **Image Optimization**: Next.js built-in image optimization with WebP support
- **Database Optimization**: MongoDB connection pooling and indexed queries
- **Caching**: Strategic caching of static assets and API responses

## 🧪 Testing

```bash
# Run tests (if implemented)
npm run test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Issues**
- Verify your `MONGODB_URI` is correct
- Check network access in MongoDB Atlas
- Ensure database user has proper permissions

**Authentication Not Working**
- Verify Google OAuth credentials
- Check `NEXTAUTH_URL` matches your domain
- Ensure `NEXTAUTH_SECRET` is set and secure

**AI Generation Failing**
- Verify `GEMINI_API_KEY` is valid
- Check API quota limits
- Ensure proper network connectivity

## 🤝 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common solutions

## 📄 License
This project is licensed under a Proprietary Software License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Next.js and React ecosystem
- UI components powered by shadcn/ui and Radix UI
- AI capabilities provided by Google Gemini
- Database services by MongoDB Atlas
- Authentication handled by NextAuth.js

---

**JSON Schema Builder Pro** - Making schema creation intuitive and powerful through cutting-edge technology and thoughtful design.

*This application represents a comprehensive solution for JSON schema management, combining modern web technologies with AI-powered assistance to streamline the development workflow.*
