#!/bin/bash

echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Copying build files to root..."
cp -r frontend/build/* .

echo "Deployment ready!" 