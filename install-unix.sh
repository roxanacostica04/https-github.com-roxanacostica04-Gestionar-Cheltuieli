#!/bin/bash

echo "========================================"
echo "   Gestionar Cheltuieli - Instalare"
echo "========================================"
echo

# Verificare Node.js
echo "Verificare Node.js..."
if ! command -v node &> /dev/null; then
    echo "EROARE: Node.js nu este instalat!"
    echo
    echo "Pentru Ubuntu/Debian:"
    echo "curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -"
    echo "sudo apt-get install -y nodejs"
    echo
    echo "Pentru macOS:"
    echo "Descarca de pe https://nodejs.org"
    echo
    exit 1
fi

echo "Node.js detectat! ✓"
echo

# Instalare dependente
echo "Instalare dependente..."
npm install
if [ $? -ne 0 ]; then
    echo "EROARE: Instalarea dependentelor a esuat!"
    exit 1
fi

# Instalare Encore CLI
echo "Instalare Encore CLI..."
npm install -g @encore/cli
if [ $? -ne 0 ]; then
    echo "EROARE: Instalarea Encore CLI a esuat!"
    echo "Incercati cu sudo: sudo npm install -g @encore/cli"
    exit 1
fi

# Configurare baza de date
echo "Configurare baza de date..."
encore db create expense
if [ $? -ne 0 ]; then
    echo "EROARE: Crearea bazei de date a esuat!"
    exit 1
fi

# Rulare migratii
echo "Rulare migratii..."
encore db migrate
if [ $? -ne 0 ]; then
    echo "EROARE: Migratiile au esuat!"
    exit 1
fi

echo
echo "========================================"
echo "   Instalarea s-a finalizat cu succes!"
echo "========================================"
echo

# Pornire aplicatie
echo "Pornire aplicatie..."
echo "Backend se porneste..."

# Pornire backend in background
encore run &
BACKEND_PID=$!

echo "Asteptare 10 secunde pentru pornirea backend-ului..."
sleep 10

echo "Frontend se porneste..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo
echo "Aplicatia se va deschide in browser in cateva secunde..."
echo
echo "URL: http://localhost:3000"
echo
echo "Conturi demo:"
echo "- admin / admin123"
echo "- user / password"
echo "- demo / demo123"
echo

sleep 5

# Deschidere browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi

echo
echo "Pentru a opri aplicatia, apasa Ctrl+C"
echo

# Asteptare pentru Ctrl+C
trap "echo 'Oprire aplicatie...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

wait
