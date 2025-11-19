#!/bin/bash
cd packages/backend
echo "Starting backend..."
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "Running: pnpm dev"
pnpm dev
