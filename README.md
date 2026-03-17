# Folio — Investment Tracker 📊

Trackeá tus CEDEARs y criptos en un solo lugar. Operaciones en pesos o dólares, con tipo de cambio blue automático.

## Stack

- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: Neon Serverless Postgres via Prisma
- **Deploy**: Vercel

## Setup rápido

### 1. Cloná el repo

```bash
git clone https://github.com/tu-usuario/investment-tracker.git
cd investment-tracker
npm install
```

### 2. Configurá la base de datos en Vercel

1. Andá a [vercel.com](https://vercel.com) y creá un nuevo proyecto importando tu repo de GitHub
2. En el dashboard del proyecto, andá a **Storage** → **Create Database** → **Neon Serverless Postgres**
3. Esto va a crear automáticamente las variables de entorno `DATABASE_URL` y `DIRECT_DATABASE_URL`

### 3. Configurá el entorno local

```bash
# Copiá el ejemplo y completá con tus datos de Neon
cp .env.example .env

# O usá Vercel CLI para bajar las variables automáticamente:
npx vercel env pull .env.local
```

### 4. Creá las tablas

```bash
npx prisma db push
```

### 5. Arrancá el servidor

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

### 6. Deploy a Vercel

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

Vercel va a hacer el build y deploy automáticamente. Asegurate de correr `prisma db push` después del primer deploy.

## Features

- ✅ Registro de compras y ventas de CEDEARs y criptos
- ✅ Operaciones en ARS o USD con tipo de cambio personalizable
- ✅ Cotización blue automática (via dolarapi.com)
- ✅ Vista de portfolio con desglose por tipo de activo
- ✅ Historial de operaciones agrupado por mes
- ✅ Cambio de moneda de visualización (ver todo en USD o ARS)
- ✅ Responsive: funciona en celular y desktop
- ✅ PWA: se puede instalar como app en el celular
- ✅ Dark theme con estética terminal financiera

## Estructura

```
├── app/
│   ├── api/
│   │   ├── assets/route.ts      # CRUD de activos
│   │   ├── trades/route.ts      # CRUD de operaciones
│   │   ├── holdings/route.ts    # Cálculo de posiciones
│   │   └── exchange-rate/route.ts # Tipo de cambio blue
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Dashboard.tsx            # Componente principal
│   ├── Header.tsx               # Navegación + moneda + TC
│   ├── PortfolioCards.tsx       # Resumen de portfolio
│   ├── HoldingsTable.tsx        # Tabla de tenencias
│   ├── TradeModal.tsx           # Modal para nueva operación
│   ├── TradesHistory.tsx        # Historial de operaciones
│   └── EmptyState.tsx           # Estado vacío
├── lib/
│   ├── prisma.ts                # Cliente Prisma (Neon)
│   └── utils.ts                 # Types y helpers
├── prisma/
│   └── schema.prisma            # Schema de la DB
└── public/
    └── manifest.json            # PWA manifest
```

## Próximos pasos posibles

- Integrar precios en tiempo real (APIs de bolsa / cripto)
- Gráficos de rendimiento histórico
- Alertas de precio
- Export a CSV/Excel
- Multi-usuario con auth
