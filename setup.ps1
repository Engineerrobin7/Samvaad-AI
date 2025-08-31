# Setup script for Samvaad AI project

Write-Host "Setting up Samvaad AI project..." -ForegroundColor Green

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Cyan
npm install

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
cd frontend
npm install
cd ..

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
cd backend
npm install
cd ..

Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the development servers:" -ForegroundColor Yellow
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Backend API will be available at: http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Note: Make sure PostgreSQL and Redis are running before starting the backend." -ForegroundColor Red