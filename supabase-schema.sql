-- =====================================================
-- SCHEMA DE BASE DE DATOS PARA CATÁLOGO DE FARMACIA
-- =====================================================

-- Tabla de productos (sincronizada desde Odoo)
CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY,
  odoo_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sku TEXT,
  list_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(10, 2),
  qty_available INTEGER DEFAULT 0,
  virtual_available INTEGER DEFAULT 0,
  description TEXT,
  image_url TEXT,
  category_id INTEGER,
  category_name TEXT,
  uom_name TEXT,
  active BOOLEAN DEFAULT true,
  write_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_products_odoo_id ON products(odoo_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_write_date ON products(write_date);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT PRIMARY KEY,
  odoo_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  parent_id INTEGER,
  parent_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  odoo_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_odoo_id ON customers(odoo_id);

-- Tabla de pedidos (órdenes de venta)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  odoo_id INTEGER UNIQUE,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, confirmed, cancelled
  total_amount DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_to_odoo BOOLEAN DEFAULT false,
  synced_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_synced ON orders(synced_to_odoo);
CREATE INDEX IF NOT EXISTS idx_orders_odoo_id ON orders(odoo_id);

-- Tabla de líneas de pedido
CREATE TABLE IF NOT EXISTS order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_sku TEXT,
  quantity INTEGER NOT NULL,
  price_unit DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_lines_order_id ON order_lines(order_id);
CREATE INDEX IF NOT EXISTS idx_order_lines_product_id ON order_lines(product_id);

-- Tabla de log de sincronización
CREATE TABLE IF NOT EXISTS sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL, -- 'initial', 'incremental', 'webhook'
  status TEXT NOT NULL, -- 'success', 'error'
  records_processed INTEGER,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER
);

CREATE INDEX IF NOT EXISTS idx_sync_log_status ON sync_log(status);
CREATE INDEX IF NOT EXISTS idx_sync_log_type ON sync_log(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_log_started ON sync_log(started_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular subtotal de línea de pedido
CREATE OR REPLACE FUNCTION calculate_order_line_subtotal()
RETURNS TRIGGER AS $$
BEGIN
  NEW.subtotal = NEW.quantity * NEW.price_unit;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_subtotal BEFORE INSERT OR UPDATE ON order_lines
  FOR EACH ROW EXECUTE FUNCTION calculate_order_line_subtotal();

-- Row Level Security (RLS) - Opcional
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_lines ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para productos y categorías
CREATE POLICY "Productos públicos" ON products FOR SELECT USING (active = true);
CREATE POLICY "Categorías públicas" ON categories FOR SELECT USING (true);

-- Los clientes solo pueden ver sus propios datos (si implementas autenticación)
-- CREATE POLICY "Clientes propios" ON customers FOR SELECT USING (auth.uid() = id);

-- Vista para productos con información completa
CREATE OR REPLACE VIEW products_view AS
SELECT 
  p.id,
  p.odoo_id,
  p.name,
  p.sku,
  p.list_price,
  p.qty_available,
  p.virtual_available,
  p.description,
  p.image_url,
  p.category_name,
  p.uom_name,
  p.active,
  CASE 
    WHEN p.qty_available > 0 THEN 'in_stock'
    WHEN p.virtual_available > 0 THEN 'pre_order'
    ELSE 'out_of_stock'
  END as stock_status
FROM products p
WHERE p.active = true;

-- Vista para resumen de pedidos
CREATE OR REPLACE VIEW orders_summary AS
SELECT 
  o.id,
  o.customer_name,
  o.customer_email,
  o.status,
  o.total_amount,
  o.created_at,
  COUNT(ol.id) as items_count,
  o.synced_to_odoo
FROM orders o
LEFT JOIN order_lines ol ON o.id = ol.order_id
GROUP BY o.id;

COMMENT ON TABLE products IS 'Productos sincronizados desde Odoo';
COMMENT ON TABLE categories IS 'Categorías de productos desde Odoo';
COMMENT ON TABLE customers IS 'Clientes del catálogo';
COMMENT ON TABLE orders IS 'Pedidos realizados en el catálogo';
COMMENT ON TABLE order_lines IS 'Líneas de detalle de cada pedido';
COMMENT ON TABLE sync_log IS 'Registro de sincronizaciones con Odoo';
