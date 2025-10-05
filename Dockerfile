# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --fund=false || npm install --omit=dev --no-audit --fund=false
COPY . .
RUN npm run build

# --- Run stage ---
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Uncomment if you want SPA routing & /status endpoint:
# COPY ansible/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]