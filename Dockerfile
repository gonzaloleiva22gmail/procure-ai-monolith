# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Install dependencies first for caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
# Note: vite.config.js is configured to output to 'dist'
RUN npm run build

# Stage 2: Serve with Python FastAPI
FROM python:3.11-slim
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY backend ./backend

# Copy Frontend Build Artifacts from Stage 1
# We allow the copy to fail effectively if dist doesn't exist, but it should exist.
# We verify the directory structure: /app/backend/static
COPY --from=frontend-builder /app/dist ./backend/static

# Environment variables
ENV PORT=8000
EXPOSE $PORT

# Run the application
# We use shell form to allow variable expansion for $PORT
CMD sh -c "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"
