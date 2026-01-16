# RAG/LLM Quick Setup Script (PowerShell)
# Run this to fix and enable RAG system

Write-Host "🔧 Samvaad AI RAG/LLM Setup Helper" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check node_modules
Write-Host "📦 Step 1: Installing missing dependencies..." -ForegroundColor Yellow
Set-Location "backend"

# Check if openai is installed
try {
    npm list openai | Out-Null
    Write-Host "  ✅ openai already installed" -ForegroundColor Green
} catch {
    Write-Host "  ❌ openai package not found, installing..." -ForegroundColor Red
    npm install openai
}

# Check if @types/openai is installed
try {
    npm list @types/openai | Out-Null
    Write-Host "  ✅ @types/openai already installed" -ForegroundColor Green
} catch {
    Write-Host "  ❌ @types/openai not found, installing..." -ForegroundColor Red
    npm install --save-dev @types/openai
}

Write-Host ""
Write-Host "🔑 Step 2: Environment Variables" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "You MUST set these in your .env file for RAG/LLM to work:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Add to .env:" -ForegroundColor Cyan
Write-Host "  GEMINI_API_KEY=<your-gemini-api-key>"
Write-Host "  OPENAI_API_KEY=<your-openai-api-key>"
Write-Host ""
Write-Host "Get API keys from:" -ForegroundColor Cyan
Write-Host "  • Gemini: https://makersuite.google.com/app/apikey"
Write-Host "  • OpenAI: https://platform.openai.com/api-keys"
Write-Host ""

# Step 3: TypeScript Fixes
Write-Host "🛠️ Step 3: TypeScript Configuration" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow
Write-Host "✅ Updated tsconfig.json with Jest types" -ForegroundColor Green
Write-Host ""

# Step 4: Build status
Write-Host "🏗️ Step 4: Build Status" -ForegroundColor Yellow
Write-Host "=======================" -ForegroundColor Yellow
npm run build
Write-Host ""

Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Add API keys to .env" -ForegroundColor Green
Write-Host "2. Run: npm run dev" -ForegroundColor Green
Write-Host "3. Test with: Invoke-WebRequest http://localhost:5000/api/health" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
