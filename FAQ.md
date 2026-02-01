# ❓ Preguntas Frecuentes (FAQ)

## General

### ¿Qué hace este sistema?

Es un catálogo virtual que muestra todos los productos de tu farmacia desde Odoo, permite a los clientes hacer pedidos, y automáticamente crea las órdenes de venta en Odoo.

### ¿Necesito conocimientos técnicos?

Para el despliegue inicial sí, pero seguir la guía paso a paso es suficiente. Una vez configurado, el sistema funciona automáticamente.

### ¿Cuánto cuesta?

- **Supabase**: Gratis hasta 500MB de base de datos
- **Vercel**: Gratis para proyectos personales/pequeños
- **GitHub**: Gratis
- **Total**: $0 para empezar

## Sincronización

### ¿Cada cuánto se actualizan los productos?

Automáticamente cada 30 minutos. Puedes ajustar esto en `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/sync",
      "schedule": "*/15 * * * *"  // Cada 15 minutos
    }
  ]
}
```

### ¿Puedo sincronizar manualmente?

Sí, en desarrollo:
```bash
npm run sync:incremental
```

En producción (Vercel):
```bash
curl https://tu-app.vercel.app/api/sync \
  -H "Authorization: Bearer tu_cron_secret"
```

### ¿Qué pasa si un producto se agota mientras un cliente lo está comprando?

El sistema valida el stock disponible antes de crear el pedido. Si no hay stock, rechaza la compra.

### ¿Se sincronizan las imágenes de productos?

Sí, las imágenes se guardan como base64 en Supabase desde Odoo.

## Pedidos

### ¿Cómo se notifica al cliente cuando hace un pedido?

Actualmente el sistema crea el pedido en Odoo. Puedes configurar notificaciones por email en Odoo mismo.

### ¿Qué pasa si falla la sincronización con Odoo al crear un pedido?

El pedido se guarda en Supabase con estado "pending" y puedes sincronizarlo manualmente después revisando la tabla `orders` donde `synced_to_odoo = false`.

### ¿Los clientes necesitan crear cuenta?

No, el checkout solo requiere nombre, email y teléfono. Los datos se guardan para futuros pedidos.

### ¿Puedo ver todos los pedidos realizados?

Sí, en Supabase:
```sql
SELECT * FROM orders ORDER BY created_at DESC;
```

O directamente en Odoo donde se sincronizan.

## Personalización

### ¿Puedo cambiar los colores del catálogo?

Sí, edita `app/globals.css` y los componentes en `components/`. El sistema usa Tailwind CSS.

### ¿Puedo agregar más filtros de búsqueda?

Sí, modifica `app/api/products/route.ts` para agregar más filtros y actualiza `app/page.tsx` para la UI.

### ¿Puedo limitar qué productos se muestran?

Sí, en `lib/odoo-client.js`, método `getProducts()`, modifica el `domain`:

```javascript
// Solo productos de una categoría específica
const domain = [
  ['sale_ok', '=', true],
  ['categ_id', '=', ID_CATEGORIA]
];
```

### ¿Puedo agregar descuentos o promociones?

Sí, necesitarías:
1. Agregar campo `discount` en la tabla `products`
2. Sincronizar descuentos desde Odoo
3. Aplicar descuentos en el cálculo del total

## Rendimiento

### ¿Cuántos productos soporta?

- Supabase gratis: hasta ~50,000 productos
- El sistema pagina resultados (20 por página)
- La búsqueda está indexada para ser rápida

### ¿Qué tan rápido carga el catálogo?

Muy rápido, porque los productos se cargan desde Supabase (cache), no directamente desde Odoo. Primera carga: ~500ms.

### ¿Puedo usar CDN para las imágenes?

Sí, recomendado para producción. Modifica `lib/odoo-client.js` para subir imágenes a Cloudinary o AWS S3 en lugar de guardarlas como base64.

## Problemas Técnicos

### Error: "Cannot connect to Supabase"

1. Verifica que las credenciales en `.env` sean correctas
2. Asegúrate de haber ejecutado el schema SQL
3. Comprueba que el proyecto Supabase esté activo

### Error: "Cannot authenticate with Odoo"

1. Verifica usuario y API key
2. Asegúrate que el usuario tenga permisos de lectura en productos
3. Prueba la conexión desde Odoo directamente

### Error: "CORS blocked"

Agrega tu dominio a las configuraciones permitidas:
- En Supabase: Settings → API → CORS
- En Vercel: automático

### Los productos no se muestran después de sincronizar

1. Revisa la tabla `sync_log` en Supabase
2. Verifica que `products.active = true`
3. Comprueba que la sincronización no haya tenido errores

### "Cannot read property 'id' of undefined"

Probablemente un producto en Odoo tiene datos incompletos. Revisa los logs de sincronización.

## Seguridad

### ¿Es seguro guardar el API key de Odoo en variables de entorno?

Sí, las variables de entorno en Vercel están encriptadas y solo accesibles en el servidor.

### ¿Los clientes pueden ver datos de otros clientes?

No, Supabase tiene Row Level Security (RLS) habilitado.

### ¿Puedo agregar autenticación de usuarios?

Sí, Supabase incluye autenticación. Necesitarías:
1. Habilitar Supabase Auth
2. Modificar las políticas RLS
3. Agregar login/registro en el frontend

## Escalabilidad

### ¿Qué pasa si tengo miles de pedidos al mes?

El plan gratuito de Vercel soporta hasta 100GB de ancho de banda. Si superas esto, necesitarás plan Pro ($20/mes).

### ¿Puedo tener múltiples tiendas?

Sí, necesitarías:
1. Multitenancy en Supabase (agregar columna `store_id`)
2. Subdominios en Vercel
3. Filtrar productos por tienda

### ¿Funciona en mobile?

Sí, el diseño es completamente responsive. También puedes convertirlo en PWA.

## Mantenimiento

### ¿Necesito hacer algo regularmente?

No, el sistema se mantiene solo. Solo monitorea ocasionalmente:
- Logs de sincronización en Supabase
- Pedidos pendientes de sincronizar con Odoo

### ¿Cómo actualizo el sistema?

```bash
git pull origin main
git add .
git commit -m "Update"
git push
```

Vercel despliega automáticamente.

### ¿Dónde veo los logs de errores?

- **Vercel**: Dashboard → Logs
- **Supabase**: Tabla `sync_log`
- **Odoo**: Logs del servidor Odoo

## Costos

### ¿Cuándo tendría que pagar?

**Supabase** (gratis hasta):
- 500MB base de datos
- 1GB archivos
- 50,000 usuarios autenticados

**Vercel** (gratis hasta):
- 100GB ancho de banda/mes
- Despliegues ilimitados

Si superas estos límites:
- Supabase Pro: $25/mes
- Vercel Pro: $20/mes

### ¿Vale la pena el costo?

Para una farmacia con catálogo online y pedidos automáticos, definitivamente sí. Ahorras tiempo en gestión manual de pedidos.

---

¿Más preguntas? Contacta: luis@gaorsystem.com
