
import React, { useState, useEffect, useCallback } from 'react';
import { OdooService } from './services/odooService';
import { useCartStore } from './lib/cartStore';
import { Product, Category, PaginationInfo, Order } from './types';
import { ProductCard } from './components/ProductCard';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'catalog' | 'orders'>('catalog');
  const [customerEmail, setCustomerEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { items, clearCart, getTotalAmount, getTotalItems, addItem, removeItem, updateQuantity } = useCartStore();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await OdooService.getProducts({
        page: currentPage,
        limit: 12,
        category: activeCategory,
        search: searchQuery
      });
      setProducts(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      setError("Estamos actualizando nuestro inventario. Por favor reintenta.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeCategory, searchQuery]);

  useEffect(() => {
    OdooService.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCheckout = async (details: any) => {
    setIsSubmittingOrder(true);
    try {
      const orderDetails = {
        ...details,
        items: items.map(i => ({
          id: i.product_id,
          name: i.name,
          sku: i.sku,
          price: i.price,
          quantity: i.quantity
        }))
      };
      const result = await OdooService.createOrder(orderDetails);
      if (result.success) {
        setOrderSuccess(result.data);
        clearCart();
        setShowCheckout(false);
        setIsCartOpen(false);
      }
    } catch (err: any) {
      alert("Lo sentimos, hubo un error al procesar tu orden.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const fetchOrders = async () => {
    if (!customerEmail) return;
    setLoading(true);
    try {
      const data = await OdooService.getOrdersByEmail(customerEmail);
      setOrders(data);
    } catch (err: any) {
      setError("No pudimos encontrar tu historial de pedidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* HEADER BOUTIQUE */}
      <header className="sticky top-0 z-50 header-glow border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-6">
          <div 
            className="flex items-center gap-2 cursor-pointer shrink-0 group" 
            onClick={() => {setViewMode('catalog'); setActiveCategory(null); setSearchQuery('');}}
          >
            <div className="bg-[#e9118c] w-10 h-10 flex items-center justify-center rounded-xl shadow-lg shadow-pink-100 group-hover:rotate-6 transition-all">
               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-slate-900 leading-none">GIO<span className="text-[#e9118c]">FARMA</span></span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Bienestar Total</span>
            </div>
          </div>

          <div className="flex-1 max-w-2xl relative">
            <div className="flex items-center bg-slate-100 rounded-2xl px-5 py-3 border border-transparent transition-all search-focus">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-slate-400 mr-3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input 
                type="text" 
                placeholder="Busca por nombre o síntoma..." 
                className="bg-transparent w-full outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setViewMode(viewMode === 'catalog' ? 'orders' : 'catalog')}
              className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#e9118c] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {viewMode === 'catalog' ? 'Mis Pedidos' : 'Tienda'}
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              {getTotalItems() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#e9118c] text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-4 border-white animate-pulse">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      {viewMode === 'catalog' && !searchQuery && !activeCategory && (
        <section className="bg-white border-b border-slate-100 pt-16 pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
            <div className="text-center lg:text-left">
              <span className="inline-block bg-pink-50 text-[#e9118c] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-8">Delivery en 45 minutos</span>
              <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter text-slate-900 leading-[1.1] mb-8">
                Tu Salud en <br/> <span className="text-[#e9118c]">Buenas Manos.</span>
              </h1>
              <p className="text-slate-500 text-lg lg:text-xl font-medium max-w-lg mb-12 mx-auto lg:mx-0">Medicamentos certificados y productos de cuidado personal al precio más justo del Perú.</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                <div className="flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700">Stock Actualizado</span>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block animate-float">
               <div className="absolute inset-0 bg-pink-50 rounded-[4rem] rotate-3 scale-105"></div>
               <img 
                src="https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?q=80&w=2069&auto=format&fit=crop" 
                alt="Pharmacy" 
                className="relative z-10 w-full h-[500px] object-cover rounded-[3.5rem] shadow-2xl border-[12px] border-white"
               />
            </div>
          </div>
        </section>
      )}

      {/* CATÁLOGO */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        {viewMode === 'catalog' ? (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* DEPARTAMENTOS */}
            <aside className="w-full lg:w-64 flex-shrink-0">
               <div className="sticky top-28 space-y-8">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 pl-2">Categorías</h3>
                    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar pb-2">
                      <button 
                        onClick={() => {setActiveCategory(null); setCurrentPage(1);}} 
                        className={`whitespace-nowrap flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeCategory === null ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                        Todo
                      </button>
                      {categories.map(cat => (
                        <button 
                          key={cat.id} 
                          onClick={() => {setActiveCategory(cat.odoo_id); setCurrentPage(1);}} 
                          className={`whitespace-nowrap px-5 py-3.5 rounded-2xl text-sm font-bold transition-all text-left ${activeCategory === cat.odoo_id ? 'bg-[#e9118c] text-white shadow-xl shadow-pink-100' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Promo Banner Sutil */}
                  <div className="hidden lg:block bg-gradient-to-br from-[#e9118c] to-[#c10e74] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-2">Gio Especial</p>
                      <h4 className="text-xl font-black italic tracking-tighter mb-4">¡Cuidamos tu bolsillo!</h4>
                      <p className="text-xs font-medium opacity-90 leading-relaxed">Encuentra genéricos de calidad con hasta 40% dcto.</p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 opacity-10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                  </div>
               </div>
            </aside>

            {/* GRILLA */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-[3/4.5] bg-white rounded-[2.5rem] border border-slate-100"></div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(product => (
                      <ProductCard key={product.id} product={product} onAddToCart={(p) => {
                        addItem({
                          product_id: p.odoo_id,
                          name: p.name,
                          sku: p.sku,
                          price: p.list_price,
                          image_url: p.image_url,
                          max_stock: p.qty_available
                        });
                        setIsCartOpen(true);
                      }} />
                    ))}
                  </div>
                  
                  {pagination && pagination.total_pages > 1 && (
                    <div className="mt-16 flex justify-center items-center gap-3">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => {setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({top: 0, behavior: 'smooth'});}}
                        className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-200 disabled:opacity-30 hover:border-[#e9118c] transition-all"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                      </button>
                      <span className="text-sm font-black text-slate-400 mx-4 uppercase tracking-[0.3em]">Pág {currentPage} / {pagination.total_pages}</span>
                      <button 
                        disabled={currentPage === pagination.total_pages}
                        onClick={() => {setCurrentPage(prev => Math.min(pagination.total_pages, prev + 1)); window.scrollTo({top: 0, behavior: 'smooth'});}}
                        className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-200 disabled:opacity-30 hover:border-[#e9118c] transition-all"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
             <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 italic tracking-tighter mb-4">Mis <span className="text-[#e9118c]">Pedidos</span></h2>
                <p className="text-slate-400 font-medium">Consulta el estado de tus compras con tu correo electrónico.</p>
             </div>
             
             <div className="bg-white rounded-[3.5rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/50 border border-slate-50 mb-12">
                <div className="flex flex-col sm:flex-row gap-4">
                   <input 
                      type="email" 
                      placeholder="Correo de la compra" 
                      className="flex-1 bg-slate-50 border-none rounded-2xl p-5 text-base font-bold focus:ring-4 focus:ring-[#e9118c]/10 outline-none placeholder:text-slate-300" 
                      value={customerEmail} 
                      onChange={e => setCustomerEmail(e.target.value)} 
                   />
                   <button onClick={fetchOrders} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Ver Historial</button>
                </div>
             </div>

             <div className="space-y-6">
               {orders.map(order => (
                 <div key={order.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
                    <div className="flex justify-between items-center">
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-black text-[#e9118c] uppercase tracking-widest">Código</span>
                            <span className="text-xl font-black text-slate-900 tracking-tight italic">#{order.odoo_id || order.id.slice(0,6).toUpperCase()}</span>
                          </div>
                          <span className="text-xs text-slate-400 font-bold">{new Date(order.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                       </div>
                       <div className="text-right">
                          <span className="block text-2xl font-black text-slate-900 tracking-tighter mb-2 leading-none">S/ {order.total_amount.toFixed(2)}</span>
                          <span className={`inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                             {order.status === 'confirmed' ? 'Entregado' : 'Procesando'}
                          </span>
                       </div>
                    </div>
                 </div>
               ))}
               {orders.length === 0 && customerEmail && !loading && (
                 <div className="text-center py-20 opacity-30">
                    <p className="font-black text-sm uppercase tracking-[0.4em]">Sin registros previos</p>
                 </div>
               )}
             </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-16 mt-auto">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
            <div className="col-span-1 md:col-span-1">
               <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                  <div className="bg-[#e9118c] w-6 h-6 flex items-center justify-center rounded-lg">
                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <span className="font-black tracking-tighter text-slate-900">GIOFARMA</span>
               </div>
               <p className="text-slate-400 text-xs font-bold leading-relaxed">Cuidado experto para ti y tu familia. Calidad garantizada en cada entrega.</p>
            </div>
            <div>
               <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">Empresa</h4>
               <ul className="space-y-4 text-xs font-bold text-slate-500">
                  <li><a href="#" className="hover:text-[#e9118c]">Sobre nosotros</a></li>
                  <li><a href="#" className="hover:text-[#e9118c]">Términos y condiciones</a></li>
               </ul>
            </div>
            <div>
               <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">Certificaciones</h4>
               <div className="flex justify-center md:justify-start gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e9118c" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
               </div>
            </div>
            <div>
               <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">Libro de Reclamaciones</h4>
               <button className="bg-slate-50 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 w-full text-slate-400">Ver Libro</button>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.5em]">© 2024 GIO FARMA • Salud Digital Premium</p>
         </div>
      </footer>

      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)} 
        items={items as any}
        total={getTotalAmount()}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        onCheckout={() => setShowCheckout(true)}
      />

      <CheckoutModal 
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSubmit={handleCheckout}
        isSubmitting={isSubmittingOrder}
      />

      {orderSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
           <div className="bg-white p-12 rounded-[4rem] text-center max-w-sm shadow-2xl scale-in-center border border-slate-100">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 className="text-3xl font-black mb-4 italic tracking-tight text-slate-900">¡Recibido!</h3>
              <p className="text-slate-500 mb-10 font-semibold leading-relaxed">Tu pedido ha sido procesado exitosamente. Recibirás un correo con el detalle en breve.</p>
              <button onClick={() => setOrderSuccess(null)} className="w-full bg-[#e9118c] text-white py-6 rounded-3xl font-black shadow-2xl shadow-pink-100 hover:scale-[1.02] transition-all uppercase tracking-[0.2em] text-xs">
                 Continuar Comprando
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
