# 🏥 Catálogo Virtual - Farmacia Baltodano

Sistema de catálogo virtual conectado con Odoo v17 y sincronización automática con Supabase.

## 📋 Características

- ✅ Sincronización automática de productos desde Odoo v17
- ✅ Cache en Supabase para cargas ultra rápidas
- ✅ Sincronización incremental cada 30 minutos
- ✅ Carrito de compras persistente
- ✅ Creación automática de pedidos en Odoo
- ✅ Interfaz responsive con Tailwind CSS
- ✅ Búsqueda y filtros por categoría
- ✅ Control de stock en tiempo real

## 🏗️ Arquitectura

```
Odoo v17 (ERP) ←→ Supabase (Cache) ←→ Next.js (Frontend)
                      ↓
                 Vercel Cron Jobs
              (Sincronización cada 30 min)
```

## 🚀 Instalación Local

### 1. Prerequisitos

- Node.js 18+ instalado
- Cuenta de Supabase (gratis)
- Acceso a Odoo v17

### 2. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd farmacia-catalogo
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar Supabase

1. Crear cuenta en [Supabase](https://supabase.com)
2. Crear nuevo proyecto
3. En el SQL Editor, ejecutar el contenido de `supabase-schema.sql`
4. Obtener las credenciales:
   - Project URL
   - Anon Key
   - Service Role Key

### 5. Configurar variables de entorno

Crear archivo `.env.local`:

```bash
# Odoo Configuration
ODOO_URL=https://baltodano.facturaclic.pe
ODOO_DB=baldonado_master
ODOO_USERNAME=luis@gaorsystem.com
ODOO_API_KEY=8d06549a109c1c0f8847610a9f8d68250de8bd39

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=tu_secreto_aleatorio_para_cron
```

### 6. Sincronización inicial

Ejecutar la sincronización inicial de productos:

```bash
npm run sync:initial
```

Este proceso puede tardar varios minutos dependiendo de la cantidad de productos.

### 7. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 📦 Despliegue en Vercel

### 1. Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <tu-repositorio-github>
git push -u origin main
```

### 2. Conectar con Vercel

1. Ir a [Vercel](https://vercel.com)
2. Importar el repositorio de GitHub
3. Configurar las variables de entorno (mismas que en `.env.local`)
4. Deploy

### 3. Configurar Vercel Cron

El archivo `vercel.json` ya está configurado para ejecutar:
- Sincronización incremental cada 30 minutos

Para probar el cron manualmente:

```bash
curl https://tu-app.vercel.app/api/sync \
  -H "Authorization: Bearer tu_cron_secret"
```

## 🔄 Sincronización

### Sincronización Inicial

Primera carga completa de todos los productos:

```bash
npm run sync:initial
```

### Sincronización Incremental

Actualiza solo los productos modificados:

```bash
npm run sync:incremental
```

### Sincronización Automática (Vercel)

Se ejecuta automáticamente cada 30 minutos vía Vercel Cron.

## 📁 Estructura del Proyecto

```
farmacia-catalogo/
├── app/
│   ├── api/
│   │   ├── categories/route.ts    # API de categorías
│   │   ├── orders/route.ts        # API de pedidos
│   │   ├── products/route.ts      # API de productos
│   │   └── sync/route.ts          # API de sincronización (cron)
│   ├── layout.tsx                 # Layout principal
│   ├── page.tsx                   # Página principal del catálogo
│   └── globals.css                # Estilos globales
├── components/
│   ├── CartSidebar.tsx            # Sidebar del carrito
│   ├── CheckoutModal.tsx          # Modal de checkout
│   └── ProductCard.tsx            # Tarjeta de producto
├── lib/
│   ├── cart-store.ts              # Store de Zustand para carrito
│   ├── odoo-client.js             # Cliente de Odoo XML-RPC
│   └── supabase.ts                # Cliente de Supabase
├── scripts/
│   ├── sync-initial.js            # Script de sincronización inicial
│   └── sync-incremental.js        # Script de sincronización incremental
├── supabase-schema.sql            # Schema de base de datos
├── .env.example                   # Ejemplo de variables de entorno
├── vercel.json                    # Configuración de Vercel
└── package.json
```

## 🔧 API Endpoints

### GET `/api/products`

Obtener productos con paginación y filtros.

**Query params:**
- `page` (default: 1)
- `limit` (default: 20)
- `category` (opcional)
- `search` (opcional)
- `in_stock` (true/false)

### GET `/api/categories`

Obtener todas las categorías.

### POST `/api/orders`

Crear nuevo pedido.

**Body:**
```json
{
  "customer_name": "Juan Pérez",
  "customer_email": "juan@ejemplo.com",
  "customer_phone": "+51999999999",
  "items": [
    {
      "product_id": 123,
      "quantity": 2
    }
  ],
  "notes": "Entregar en la tarde"
}
```

### GET `/api/sync`

Ejecutar sincronización incremental (requiere autorización).

**Headers:**
```
Authorization: Bearer CRON_SECRET
```

## 📊 Base de Datos (Supabase)

### Tablas Principales

- **products**: Productos sincronizados desde Odoo
- **categories**: Categorías de productos
- **orders**: Pedidos realizados
- **order_lines**: Líneas de detalle de pedidos
- **customers**: Clientes
- **sync_log**: Registro de sincronizaciones

## 🔐 Seguridad

- Row Level Security (RLS) habilitado en Supabase
- API de sincronización protegida con secret
- Validación de stock antes de crear pedidos
- Variables de entorno para credenciales sensibles

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Estado**: Zustand
- **Base de Datos**: Supabase (PostgreSQL)
- **ERP**: Odoo v17 (XML-RPC)
- **Deploy**: Vercel
- **Iconos**: Lucide React

## 📝 Flujo de Pedidos

1. Cliente agrega productos al carrito
2. Completa formulario de checkout
3. Sistema valida stock disponible
4. Crea pedido en Supabase
5. Sincroniza pedido con Odoo automáticamente
6. Actualiza estado del pedido
7. Cliente recibe confirmación

## 🔄 Mantenimiento

### Ver logs de sincronización

```sql
SELECT * FROM sync_log 
ORDER BY started_at DESC 
LIMIT 10;
```

### Productos más vendidos

```sql
SELECT 
  p.name,
  SUM(ol.quantity) as total_sold
FROM order_lines ol
JOIN products p ON ol.product_id = p.id
GROUP BY p.id, p.name
ORDER BY total_sold DESC
LIMIT 10;
```

## 🐛 Troubleshooting

### Error de sincronización

1. Verificar logs en Supabase (tabla `sync_log`)
2. Verificar credenciales de Odoo
3. Comprobar conectividad con Odoo

### Productos no aparecen

1. Ejecutar sincronización inicial nuevamente
2. Verificar que productos tengan `sale_ok = true` en Odoo
3. Revisar filtros activos en el catálogo

### Pedidos no se sincronizan con Odoo

1. Revisar logs en consola del servidor
2. Verificar permisos del usuario en Odoo
3. Comprobar que los productos existan en Odoo

## 📞 Soporte

Para problemas o preguntas, contactar a: luis@gaorsystem.com

## 📄 Licencia

Propiedad de Farmacia Baltodano - Todos los derechos reservados.
