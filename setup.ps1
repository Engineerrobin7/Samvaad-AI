# Setup script for Samvaad AI project

Write-Host "Setting up Samvaad AI project..." -ForegroundColor Green

# Get the script directory to ensure we're working from the correct location
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Cyan
npm install

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Push-Location "frontend"
if (Test-Path "package.json") {
    npm install
} else {
    Write-Host "No package.json found in frontend directory" -ForegroundColor Yellow
}
Pop-Location

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Push-Location "backend"
if (Test-Path "package.json") {
    npm install
} else {
    Write-Host "No package.json found in backend directory" -ForegroundColor Yellow
}
Pop-Location

Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the development servers:" -ForegroundColor Yellow
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Backend API will be available at: http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Note: Make sure PostgreSQL and Redis are running before starting the backend." -ForegroundColor Red
