# StockFlow - Full-Stack Stock Market App

A modern, full-stack stock market web application inspired by Groww.in, built with Next.js, MongoDB, and real-time stock data integration.

## 🚀 Features

### Frontend
- **Modern UI/UX**: Clean, minimalist design inspired by Groww
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: Complete dark/light theme support
- **Smooth Animations**: Framer Motion for delightful interactions

### Backend
- **Authentication**: JWT-based auth with bcrypt password hashing
- **Database**: MongoDB with Mongoose ODM
- **RESTful API**: Express.js-style API routes in Next.js
- **Stock Data**: Integration with Alpha Vantage API for live stock data

### Pages & Functionality
1. **Landing Page**: Hero section, trending stocks, feature highlights
2. **Authentication**: Login/signup with floating labels and validation
3. **Dashboard**: Personalized greeting, market overview, top gainers/losers
4. **Stock Details**: Individual stock pages with key metrics
5. **Profile**: User settings, password change, account management

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stockflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update the following variables in `.env.local`:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `ALPHA_VANTAGE_API_KEY`: Your Alpha Vantage API key

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   # Or use MongoDB Atlas cloud database
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🗄 Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/me` - Get current user

### Stocks
- `GET /api/stocks/[symbol]` - Get stock data by symbol

## 🎨 UI Components

- **Navbar**: Responsive navigation with theme toggle
- **Footer**: Links and social media
- **StockCard**: Reusable stock display component
- **Theme Provider**: Dark/light mode management

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with:
```env
MONGODB_URI=mongodb://localhost:27017/stockflow
JWT_SECRET=your-super-secret-jwt-key-here
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
NEWS_API_KEY=your-news-api-key
```

## 🚀 Deployment

### Manual Deployment
1. Build the application: `npm run build`
2. Start the production server: `npm start`

### MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Add to environment variables

## 🔑 API Keys Setup

### Alpha Vantage (Stock Data)
1. Sign up at [Alpha Vantage](https://www.alphavantage.co/)
2. Get your free API key
3. Add to `.env.local`: `ALPHA_VANTAGE_API_KEY=your_key_here`

### MongoDB Atlas (Database)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Add to environment variables

## 📊 Advanced Features

### Portfolio Analytics
- Real-time portfolio valuation
- Gain/loss calculations with percentages
- Transaction history and audit trail
- Performance tracking over time

### News & Market Data
- Real-time market news integration
- Stock-specific news filtering
- Multiple news categories

## 🔧 Production Considerations

### Performance Optimization
- API response caching
- Database query optimization
- Image optimization with Next.js

### Monitoring & Analytics
- Error tracking and logging
- Performance monitoring
- User analytics
- API usage tracking

## 📱 Features in Detail

### Authentication System
- Secure JWT-based authentication
- Password hashing with bcrypt
- Protected routes and API endpoints
- Persistent login sessions

### Stock Data Management
- Real-time stock price updates
- Key financial metrics
- Market cap, P/E ratio, volume data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

- Stock data provided by Alpha Vantage
- UI components from shadcn/ui
- Icons from Lucide React

## 🚀 API & Data

- **Alpha Vantage Integration**: Live stock data with real-time quotes
- **Company Overview**: Detailed company information and metrics

### News Integration
- **Market News**: Latest financial news from NewsAPI
- **Stock-Specific News**: News filtered by stock symbol
- **Category Filtering**: Business, technology, health, and general news
- **Real-time Updates**: Fresh news content with timestamps
