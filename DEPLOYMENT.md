# 🚀 Guía Rápida de Despliegue

## Pasos para Desplegar el Catálogo

### 1️⃣ Configurar Supabase (5 minutos)

1. **Crear cuenta**: https://supabase.com
2. **Crear proyecto nuevo**
3. **Ejecutar el schema**:
   - Ir a SQL Editor
   - Copiar contenido de `supabase-schema.sql`
   - Ejecutar
4. **Obtener credenciales**:
   - Settings → API
   - Copiar: Project URL, anon key, service_role key

### 2️⃣ Subir a GitHub (3 minutos)

```bash
# En tu terminal, dentro de la carpeta del proyecto:
git init
git add .
git commit -m "Initial commit - Catálogo Farmacia"
git branch -M main

# Crear repositorio en GitHub primero, luego:
git remote add origin https://github.com/tu-usuario/farmacia-catalogo.git
git push -u origin main
```

### 3️⃣ Desplegar en Vercel (5 minutos)

1. **Ir a**: https://vercel.com
2. **Importar proyecto** desde GitHub
3. **Configurar variables de entorno**:

```
ODOO_URL=https://baltodano.facturaclic.pe
ODOO_DB=baldonado_master
ODOO_USERNAME=luis@gaorsystem.com
ODOO_API_KEY=8d06549a109c1c0f8847610a9f8d68250de8bd39
NEXT_PUBLIC_SUPABASE_URL=[TU_SUPABASE_URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[TU_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[TU_SERVICE_ROLE_KEY]
CRON_SECRET=[GENERAR_UN_SECRET_ALEATORIO]
```

4. **Deploy** ✅

### 4️⃣ Sincronización Inicial (10 minutos)

Desde tu computadora local:

```bash
# Instalar dependencias
npm install

# Crear archivo .env.local con las mismas variables

# Ejecutar sincronización
npm run sync:initial
```

**¡Listo!** 🎉 

Tu catálogo ya está en línea en: `https://tu-proyecto.vercel.app`

---

## ⚙️ Configuración Automática

El sistema ya está configurado para:
- ✅ Sincronización automática cada 30 minutos
- ✅ Creación de pedidos en Odoo
- ✅ Actualización de stock en tiempo real

## 🔄 Para actualizar el código después:

```bash
git add .
git commit -m "Descripción de cambios"
git push
```

Vercel desplegará automáticamente los cambios.

## 📱 Probar Localmente Antes de Desplegar

```bash
npm run dev
# Abrir: http://localhost:3000
```

## 🆘 Problemas Comunes

### "No se cargan los productos"
→ Ejecuta `npm run sync:initial`

### "Error de sincronización"
→ Verifica las credenciales de Odoo en las variables de entorno

### "Error de Supabase"
→ Asegúrate de haber ejecutado el schema SQL completo

---

**Tiempo total estimado**: 20-25 minutos

¿Necesitas ayuda? Contacta a: luis@gaorsystem.com
