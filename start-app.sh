#!/usr/bin/env bash

echo "🚀 Starting Pharmacology Trainer..."
echo ""

# Try to find Node.js in common locations
NODE_PATHS=(
  "/usr/local/share/nvm/current/bin"
  "/home/codespace/nvm/current/bin"
  "$HOME/.nvm/versions/node/*/bin"
  "/usr/local/bin"
  "/usr/bin"
)

for path in "${NODE_PATHS[@]}"; do
  if [ -d "$path" ] && [ -x "$path/node" ]; then
    echo "✓ Found Node.js in: $path"
    export PATH="$path:$PATH"
    break
  fi
done

# Check if node is now available
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found in PATH"
  echo ""
  echo "Please try one of these options:"
  echo ""
  echo "Option 1: Open a NEW terminal in VS Code (Terminal → New Terminal)"
  echo "          Then run: cd /workspaces/pharmacology-trainer && pnpm dev"
  echo ""
  echo "Option 2: Reload your VS Code window"
  echo "          Then run: ./start-app.sh"
  echo ""
  exit 1
fi

# Show versions
echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"
echo ""

# Navigate to project directory
cd /workspaces/pharmacology-trainer || exit 1

# Check if dependencies are installed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/next" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Start the development server
echo "🚀 Starting development server on http://localhost:3000"
echo ""
exec npm run dev
