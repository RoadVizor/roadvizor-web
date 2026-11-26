# ---------- Stage 1: builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

# dependências (determinístico)
COPY package.json package-lock.json ./
RUN npm ci --silent

# copiar o restante do código e gerar assets
COPY . .
# build deve gerar public/css/output.css e outros artefatos
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# criar usuário não-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# copiar artefatos do builder
COPY --from=builder /app ./
RUN chown -R appuser:appgroup /app

USER appuser
EXPOSE 3000
CMD ["node", "app.js"]
