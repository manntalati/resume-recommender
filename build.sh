#!/bin/bash

# Build the frontend
cd frontend
npm install
npm run build
cd ..

echo "Build completed successfully!" 