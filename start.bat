@echo off
echo Starting Shopee Live System...

start cmd /k "cd server && npm run dev"
start cmd /k "cd client && npm run dev"

echo Backend running on http://localhost:5000
echo Frontend running on http://localhost:5173
echo.
echo Users:
echo Admin: admin@shopee.com / admin123
echo Collab: colaborador@shopee.com / collab123
