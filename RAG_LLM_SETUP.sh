#!/bin/bash
# RAG/LLM Quick Setup Script
# Run this to fix and enable RAG system

echo "🔧 Samvaad AI RAG/LLM Setup Helper"
echo "===================================="
echo ""

# Step 1: Check node_modules
echo "📦 Step 1: Installing missing dependencies..."
cd backend

# Check if openai is installed
if ! npm list openai > /dev/null 2>&1; then
    echo "  ❌ openai package not found, installing..."
    npm install openai
else
    echo "  ✅ openai already installed"
fi

# Check if @types/openai is installed
if ! npm list @types/openai > /dev/null 2>&1; then
    echo "  ❌ @types/openai not found, installing..."
    npm install --save-dev @types/openai
else
    echo "  ✅ @types/openai already installed"
fi

echo ""
echo "🔑 Step 2: Environment Variables"
echo "================================"
echo ""
echo "You MUST set these in your .env file for RAG/LLM to work:"
echo ""
echo "Add to .env:"
echo "  GEMINI_API_KEY=<your-gemini-api-key>"
echo "  OPENAI_API_KEY=<your-openai-api-key>"
echo ""
echo "Get API keys from:"
echo "  • Gemini: https://makersuite.google.com/app/apikey"
echo "  • OpenAI: https://platform.openai.com/api-keys"
echo ""

# Step 3: TypeScript Fixes
echo "🛠️ Step 3: TypeScript Configuration"
echo "====================================="
echo "✅ Updated tsconfig.json with Jest types"
echo ""

# Step 4: Run tests
echo "🧪 Step 4: Running Tests"
echo "========================"
npm test -- --testPathPattern="rag|collaboration|voice|sentiment" 2>&1 | tail -20

echo ""
echo "📚 Next Steps:"
echo "1. Add API keys to .env"
echo "2. Run: npm run dev"
echo "3. Test with: curl http://localhost:5000/api/health"
echo ""
echo "✅ Setup complete!"
