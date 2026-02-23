# syntax=docker/dockerfile:1
# Cinema Guru – frontend Vite + React
# Par défaut : image production. Dev : docker build -t cinema-guru:dev --target dev .

# -----------------------------------------------------------------------------
# Stage: builder (build de l’app)
# -----------------------------------------------------------------------------
FROM node:24-alpine AS builder

WORKDIR /app

# Dépendances (cache de couche si package*.json inchangés)
COPY package.json package-lock.json ./
RUN npm ci

# Variables Vite (injectées au build) – à passer en --build-arg en prod
ARG VITE_TMDB_ACCESS_TOKEN
ARG VITE_FANART_TV_API_KEY
ARG VITE_FANART_TV_CLIENT_KEY=
ENV VITE_TMDB_ACCESS_TOKEN=${VITE_TMDB_ACCESS_TOKEN}
ENV VITE_FANART_TV_API_KEY=${VITE_FANART_TV_API_KEY}
ENV VITE_FANART_TV_CLIENT_KEY=${VITE_FANART_TV_CLIENT_KEY}

COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# Stage: dev (serveur de dev Vite avec hot reload)
# -----------------------------------------------------------------------------
FROM node:24-alpine AS dev

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# En dev, les variables Vite sont lues au runtime. Exemple :
#   docker run -e VITE_TMDB_ACCESS_TOKEN=... -e VITE_FANART_TV_API_KEY=... -p 3000:3000 cinema-guru:dev
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# -----------------------------------------------------------------------------
# Stage: production (servir les fichiers statiques avec nginx) – cible par défaut
# -----------------------------------------------------------------------------
FROM nginx:alpine AS production

RUN apk add --no-cache dumb-init

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]
