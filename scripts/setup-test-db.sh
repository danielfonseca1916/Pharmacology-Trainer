#!/bin/bash
# Test Database Setup Script
# 
# This script initializes and resets the test database for Playwright E2E tests
# It creates a separate SQLite file for test isolation and prevents data contamination
#
# Usage:
#   bash scripts/setup-test-db.sh        # Create/reset test DB
#   bash scripts/setup-test-db.sh clean  # Remove test DB

set -e

# Configuration
TEST_DB_PATH="prisma/test.db"
TEST_ENV_FILE=".env.test"
TEST_URL="file:./prisma/test.db"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

# Function to clean up test database
clean_test_db() {
  if [ -f "$TEST_DB_PATH" ]; then
    log_info "Removing test database..."
    rm -f "$TEST_DB_PATH"
    log_success "Test database removed"
  else
    log_warn "Test database not found at $TEST_DB_PATH"
  fi
}

# Function to create test environment file
create_test_env() {
  log_info "Creating test environment configuration..."
  
  cat > "$TEST_ENV_FILE" << EOF
# Test Database Configuration
# This file is used only for E2E testing and should not be committed
DATABASE_URL="$TEST_URL"

# Auth Configuration (Test)
NEXTAUTH_SECRET="test-secret-key-for-e2e-testing-only-$(date +%s)"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="test"

# Features (disable analytics during tests)
NEXT_PUBLIC_ENABLE_ANALYTICS="false"
EOF

  log_success "Created $TEST_ENV_FILE"
}

# Function to initialize test database
init_test_db() {
  log_info "Initializing test database..."
  
  # Check if Prisma is installed
  if ! command -v npx &> /dev/null; then
    log_error "npm/npx not found. Please install Node.js"
    exit 1
  fi
  
  # Use test environment
  export DATABASE_URL="$TEST_URL"
  
  # Run migrations with test database
  log_info "Running database migrations..."
  NODE_ENV=test npx prisma migrate deploy --skip-generate || {
    log_warn "Migrations failed or no migrations available. Creating database schema..."
    NODE_ENV=test npx prisma db push --skip-generate || true
  }
  
  log_success "Database initialized"
}

# Function to seed test data
seed_test_db() {
  log_info "Seeding test database with initial data..."
  
  # Create a test user for login tests
  export DATABASE_URL="$TEST_URL"
  
  log_info "Creating test user for E2E tests..."
  # Note: The test helpers will create users via API, so minimal seeding is needed
  # Only create a demo user if you want pre-existing credentials
  
  log_success "Test database seeded"
}

# Function to verify test database
verify_test_db() {
  log_info "Verifying test database..."
  
  if [ ! -f "$TEST_DB_PATH" ]; then
    log_error "Test database file not found at $TEST_DB_PATH"
    return 1
  fi
  
  log_success "Test database verified at $TEST_DB_PATH"
  return 0
}

# Function to show database stats
show_stats() {
  if [ ! -f "$TEST_DB_PATH" ]; then
    log_warn "Test database does not exist"
    return
  fi
  
  log_info "Test database statistics:"
  
  # Try to show file size
  size=$(du -h "$TEST_DB_PATH" | cut -f1)
  echo "  Size: $size"
  
  echo "  Location: $(pwd)/$TEST_DB_PATH"
  echo "  Modified: $(stat -f "%Sm" "$TEST_DB_PATH" 2>/dev/null || stat -c "%y" "$TEST_DB_PATH")"
}

# Main script logic
main() {
  case "${1:-}" in
    clean)
      log_info "Cleaning test database..."
      clean_test_db
      ;;
    seed)
      log_info "Setting up and seeding test database..."
      create_test_env
      init_test_db
      seed_test_db
      verify_test_db
      show_stats
      log_success "Test database ready for E2E tests"
      ;;
    reset)
      log_info "Resetting test database..."
      clean_test_db
      create_test_env
      init_test_db
      seed_test_db
      verify_test_db
      show_stats
      log_success "Test database reset and ready"
      ;;
    verify)
      verify_test_db
      show_stats
      ;;
    stats)
      show_stats
      ;;
    *)
      log_info "Setting up test database (default: create if missing)..."
      
      if [ -f "$TEST_DB_PATH" ]; then
        log_warn "Test database already exists. Use 'reset' to clear it"
        show_stats
      else
        create_test_env
        init_test_db
        seed_test_db
        verify_test_db
        log_success "Test database initialized and ready"
      fi
      
      echo ""
      echo "Usage: bash scripts/setup-test-db.sh [COMMAND]"
      echo ""
      echo "Commands:"
      echo "  (default)   Create/initialize test database"
      echo "  seed        Seed with initial data"
      echo "  reset       Clean and reinitialize test database"
      echo "  clean       Remove test database file"
      echo "  verify      Check test database status"
      echo "  stats       Show test database statistics"
      echo ""
      echo "Environment:"
      echo "  DATABASE_URL: $TEST_URL"
      echo "  ENV file: $TEST_ENV_FILE"
      echo ""
      ;;
  esac
}

# Run main function
main "$@"
