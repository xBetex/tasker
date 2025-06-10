# 📋 Task Dashboard 2.0

A modern, full-stack task management application built with Next.js, React, and FastAPI with comprehensive testing infrastructure and Docker support.

## 🚀 Features

### 📊 **Core Dashboard**
- **Client Management** - Organize tasks by client with expandable cards
- **Task Tabs** - Each client card has "Active" and "Completed" task tabs
- **Bulk Task Completion** - Automatically complete tasks older than 1 week
- **Real-time Progress** - Visual progress bars for each client
- **Analytics Dashboard** - Comprehensive task analytics with charts and KPIs

### 🎯 **Task Management** 
- **SLA Management** - Track due dates and overdue tasks with visual indicators
- **Priority System** - High, medium, low priority levels with color coding
- **Status Tracking** - Pending, In Progress, Awaiting Client, Completed
- **Comments System** - Add notes and comments to tasks
- **Advanced Filtering** - Filter tasks by status, priority, client, and date ranges

### 🎨 **User Experience**
- **🌙 Dark/Light Mode** - Full theme support throughout the application
- **📱 Responsive Design** - Works seamlessly on desktop and mobile
- **🔔 Toast Notifications** - Real-time feedback for all user actions
- **📈 Real-time Updates** - Live data synchronization between frontend and backend
- **Drag & Drop** - Sortable client cards for better organization

### 🧪 **Testing & Quality**
- **Jest Testing** - Unit tests for components and utilities
- **Playwright E2E** - End-to-end testing automation
- **Docker Testing** - Isolated testing environments
- **Coverage Reports** - 70% minimum coverage threshold
- **Automated Scripts** - Cross-platform testing scripts

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.3.1** - React framework with App Router and Turbopack
- **React 19.0.0** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **TailwindCSS 4** - Utility-first CSS framework with latest features
- **Framer Motion** - Smooth animations and transitions
- **Chart.js** - Data visualization
- **DND Kit** - Drag and drop functionality
- **React DatePicker** - Date selection components

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite/PostgreSQL** - Database options
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server

### Testing & Development
- **Jest 29** - JavaScript testing framework
- **React Testing Library** - Component testing utilities
- **Playwright** - End-to-end testing
- **Docker** - Containerized development and testing
- **ESLint & Prettier** - Code formatting and linting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+ (for backend)
- Docker & Docker Compose (recommended)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd task-dashboard

# Start with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (if using PostgreSQL)
alembic upgrade head

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server with Turbopack
npm run dev

# Access at http://localhost:3000
```

### Option 3: PowerShell Script (Windows)
```powershell
# Run the automated setup script
.\start-app.ps1
```

## 📁 Project Structure

```
task-dashboard/
├── src/                          # Frontend source code
│   ├── app/                      # Next.js App Router
│   │   ├── components/           # React components
│   │   │   ├── client/           # Client-specific components
│   │   │   └── analytics/        # Analytics components
│   │   ├── contexts/             # React contexts
│   │   ├── hooks/                # Custom hooks
│   │   ├── analytics/            # Analytics dashboard
│   │   └── filtered-tasks/       # Task filtering page
│   ├── services/                 # API services
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   │   ├── bulkTaskUtils.ts      # Bulk task operations
│   │   ├── dateUtils.ts          # Date handling utilities
│   │   └── test-utils.tsx        # Testing utilities
│   └── __tests__/                # Test files
│       ├── components/           # Component tests
│       ├── utils/                # Utility tests
│       └── integration/          # Integration tests
├── tests/                        # E2E tests
│   ├── e2e/                      # Playwright tests
│   ├── global-setup.ts           # Test setup
│   └── global-teardown.ts        # Test cleanup
├── backend/                      # Backend source code
│   ├── main.py                   # FastAPI application
│   ├── models.py                 # Database models
│   ├── schemas.py                # Pydantic schemas
│   ├── database.py               # Database configuration
│   └── migrations/               # Database migrations
├── public/                       # Static assets
├── docs/                         # Documentation files
├── docker-compose.yml            # Main Docker configuration
├── docker-compose.test.yml       # Testing Docker configuration
├── Dockerfile.test               # Multi-stage test container
└── jest.config.js                # Jest configuration
```

## 🔧 Development

### Available Scripts

#### Frontend
```bash
npm run dev             # Start development server with Turbopack
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript type checking
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
```

#### Testing
```bash
npm test                # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
npm run test:e2e        # Run Playwright E2E tests
npm run test:e2e:ui     # Run E2E tests with UI mode
npm run test:docker     # Run all tests in Docker
npm run test:docker:unit # Run only unit tests in Docker
npm run test:docker:e2e  # Run only E2E tests in Docker
```

#### Backend
```bash
# In backend directory
uvicorn main:app --reload    # Development server
python -m pytest            # Run tests
python -m pytest --cov      # Run tests with coverage
black .                      # Format code
isort .                      # Sort imports
flake8 .                     # Lint code
```

#### Docker
```bash
npm run docker:build       # Build Docker images
npm run docker:up          # Start containers
npm run docker:down        # Stop containers
```

### Testing with Cross-Platform Scripts

#### Windows
```batch
# Run all tests
run-tests-docker.bat

# Run specific test types
run-tests-docker.bat unit
run-tests-docker.bat e2e
run-tests-docker.bat all
```

#### Linux/Mac
```bash
# Make script executable
chmod +x run-tests-docker.sh

# Run all tests
./run-tests-docker.sh

# Run specific test types
./run-tests-docker.sh unit
./run-tests-docker.sh e2e
./run-tests-docker.sh all
```

### Environment Variables

Create `.env.local` for development:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME="Task Dashboard"
NODE_ENV=development
```

Create `backend/.env` for backend:
```bash
DATABASE_URL=sqlite:///./task_manager.db
SECRET_KEY=your-secret-key-here
DEBUG=true
CORS_ORIGINS=http://localhost:3000
```

## 📊 API Documentation

The FastAPI backend provides interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints
- `GET /clients/` - List all clients with tasks
- `POST /clients/` - Create new client
- `POST /tasks/` - Create new task
- `PUT /tasks/{task_id}` - Update task
- `DELETE /tasks/{task_id}` - Delete task
- `POST /tasks/{task_id}/comments/` - Add comment to task

## 🧪 Testing Infrastructure

The project includes comprehensive testing setup:

### Unit Tests (Jest + React Testing Library)
- Component testing with mock data
- Utility function testing
- Custom hook testing
- 70% minimum coverage threshold

### Integration Tests
- API endpoint testing
- Database operations
- Service layer validation

### End-to-End Tests (Playwright)
- User workflow testing
- Cross-browser compatibility
- Mobile responsive testing
- Visual regression testing

### Docker Testing Environment
- Isolated test containers
- Automated test execution
- Coverage report generation
- Cross-platform script support

### Quick Testing Commands
```bash
# Validate infrastructure
npm test src/__tests__/demo.test.ts

# Run all tests with coverage
npm run test:coverage

# E2E testing with UI
npm run test:e2e:ui

# Docker-based testing (all platforms)
./run-tests-docker.sh  # Linux/Mac
run-tests-docker.bat   # Windows
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
npm run build
npm start

# Backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Testing in Production-like Environment
```bash
# Use test Docker setup
docker-compose -f docker-compose.test.yml up --build
```

## 📈 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- **Bundle Size**: Optimized with Next.js automatic code splitting and Turbopack
- **Database**: Indexed queries for fast data retrieval
- **Caching**: Browser caching and optimized API responses
- **Loading States**: Skeleton loaders and progressive loading

## 🔒 Security

- Input validation with Pydantic
- SQL injection protection with SQLAlchemy
- XSS protection with content sanitization
- CORS configuration for cross-origin requests
- Rate limiting (configurable)
- Dependency vulnerability scanning

## 📚 Documentation

The project includes comprehensive documentation:

- **[Testing Guide](HOW_TO_TEST.md)** - Complete testing workflow
- **[Testing Plan](TESTING_PLAN.md)** - Comprehensive testing strategy
- **[Test Summary](TESTS_SUMMARY.md)** - Implementation overview
- **[Improvements](IMPROVEMENTS_IMPLEMENTED.md)** - Recent enhancements
- **[Project Analysis](ANÁLISE_E_MELHORIAS_2024.md)** - Detailed project analysis

## 🆕 Recent Features

### Client Task Tabs
- **Individual Card Tabs**: Each client card has "Active" and "Completed" task tabs
- **Smart Counters**: Real-time task count badges
- **Tab Persistence**: Tab state maintained per client
- **Visual Indicators**: Emoji and color-coded tabs

### Bulk Task Completion
- **Automatic Detection**: Identifies tasks older than 1 week  
- **Per-Client Operations**: Bulk complete old tasks for individual clients
- **Progress Tracking**: Real-time completion progress
- **Error Handling**: Comprehensive error reporting and retry logic
- **Batch Processing**: Optimized API calls to prevent server overload

### Enhanced UI/UX
- **Responsive Design**: Optimized for all screen sizes
- **Dark/Light Theme**: Consistent theming throughout
- **Loading States**: Skeleton loaders and progress indicators
- **Toast Notifications**: Real-time user feedback
- **Drag & Drop**: Sortable client cards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new features
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features (unit, integration, and E2E)
- Use conventional commit messages
- Ensure code passes linting and type checking
- Test in both Docker and local environments
- Update documentation for new features

### Code Quality Requirements
- Unit tests with 70% minimum coverage
- E2E tests for user workflows
- ESLint and Prettier compliance
- TypeScript strict mode compliance
- Cross-browser compatibility testing

## 🆘 Support & Troubleshooting

### Common Issues
1. **Docker Issues**: Ensure Docker and Docker Compose are installed and running
2. **Port Conflicts**: Check if ports 3000/8000 are available
3. **Node Version**: Use Node.js 18+ for compatibility
4. **Testing Issues**: Run `npm run test:docker` for isolated testing environment

### Getting Help
1. Check the [comprehensive documentation](./docs/)
2. Review the [API documentation](http://localhost:8000/docs) when running
3. Run the demo test: `npm test src/__tests__/demo.test.ts`
4. Create an issue in the repository with:
   - Environment details (OS, Node version, Docker version)
   - Steps to reproduce
   - Error messages and logs

## 🎯 Roadmap

### Short Term (Next Release)
- [ ] Enhanced error boundaries and error handling
- [ ] Performance optimizations for large datasets
- [ ] Advanced filtering and search capabilities
- [ ] Keyboard shortcuts and accessibility improvements

### Medium Term
- [ ] User authentication and authorization
- [ ] Real-time notifications with WebSockets
- [ ] Advanced reporting and export features
- [ ] Mobile app with React Native
- [ ] Advanced task automation and workflows

### Long Term
- [ ] Multi-tenant architecture
- [ ] Integration with external calendar systems
- [ ] Advanced analytics and machine learning insights
- [ ] Workflow automation and custom triggers
- [ ] Enterprise features and SSO integration

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using modern web technologies**

### Key Technologies
- **Frontend**: React 19, Next.js 15, TypeScript, TailwindCSS 4, Framer Motion
- **Backend**: FastAPI, SQLAlchemy, Pydantic, Uvicorn
- **Testing**: Jest, Playwright, React Testing Library, Docker
- **DevOps**: Docker, Docker Compose, Cross-platform scripts
- **Tools**: ESLint, Prettier, Turbopack, Chart.js, DND Kit
