#!/bin/bash

echo "🚀 OTPGuard SaaS Setup Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the OTPGuard root directory"
    exit 1
fi

echo -e "${BLUE}Step 1: Backend Setup${NC}"
echo "-----------------------------------"

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -q -r requirements.txt

echo "Initializing database..."
python3 << EOF
from app import create_app
from app.extensions import db
from app.subscription.service import SubscriptionService

app = create_app()
with app.app_context():
    db.create_all()
    print("✅ Database tables created")
    
    SubscriptionService.initialize_default_plans()
    print("✅ Subscription plans initialized")
EOF

echo ""
echo -e "${GREEN}✅ Backend setup complete!${NC}"
echo ""

cd ..

echo -e "${BLUE}Step 2: Frontend Setup${NC}"
echo "-----------------------------------"

if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
else
    echo "Node modules already installed"
fi

echo ""
echo -e "${GREEN}✅ Frontend setup complete!${NC}"
echo ""

echo -e "${YELLOW}================================${NC}"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo -e "${YELLOW}================================${NC}"
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python run.py"
echo ""
echo "2. Start Frontend (in new terminal):"
echo "   npm run dev"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:5000"
echo "   API Docs: http://localhost:5000/apidocs"
echo ""
echo "📚 Documentation:"
echo "   - Implementation Guide: SAAS_IMPLEMENTATION_GUIDE.md"
echo "   - API Reference: FEATURE_GATING_API.md"
echo ""
echo "Happy coding! 🚀"
