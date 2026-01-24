// Konum: frontend/ui/src/pages/OrderDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = 'https://bahce-ifirdevs.com.tr/api';

const statusMap = {
  PENDING: 'Beklemede',
  PAID: 'Ödendi (Hazırlanıyor)',
  PREPARING: 'Hazırlanıyor',
  SHIPPED: 'Kargolandı',
  DELIVERED: 'Teslim Edildi',
  CANCELED: 'İptal Edildi'
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, authLoading } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrder();
    }
  }, [id, isAuthenticated]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/orders/${id}`);
      setOrder(response.data);
      setNewNote(response.data.notes || ''); 
      setError(null);
    } catch (err) {
      setError("Sipariş detayı yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async () => {
    setNoteLoading(true);
    try {
      await axios.put(`${API_URL}/orders/${id}/note`, { note: newNote });
      alert("Mesaj kartınız güncellendi!");
      setIsEditingNote(false);
      fetchOrder(); 
    } catch (err) {
      alert("Güncelleme hatası: " + (err.response?.data?.message || err.message));
    } finally {
      setNoteLoading(false);
    }
  };

  const canEditNote = order && ['PENDING', 'PAID', 'PREPARING'].includes(order.status);

  if (authLoading) return <div style={{padding:'50px', textAlign:'center'}}>Yükleniyor...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Sipariş detayı yükleniyor...</div>;
  if (error) return <div style={{padding:'50px', textAlign:'center', color:'var(--danger)'}}>HATA: {error}</div>;
  if (!order) return <div style={{padding:'50px', textAlign:'center'}}>Sipariş bulunamadı.</div>;

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="product-card" style={{ padding: '30px', height: 'auto' }}>
        
        <div style={{display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', gap:'10px'}}>
          <h2 style={{margin:0, color:'var(--primary)', fontSize:'1.8rem', fontFamily:'var(--font-heading)'}}>
            Sipariş #{order.id}
          </h2>
          <span style={{
            padding:'6px 15px', borderRadius:'20px', fontWeight:'bold', fontSize:'0.9rem',
            background: order.status === 'DELIVERED' ? '#E8F5E9' : '#FFF3E0',
            color: order.status === 'DELIVERED' ? '#2E7D32' : '#EF6C00'
          }}>
            {statusMap[order.status] || order.status}
          </span>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '30px', 
          marginBottom:'30px' 
        }}>
          {/* Alıcı Bilgileri */}
          <div style={{ padding: '20px', background: 'var(--bg-body)', borderRadius: 'var(--radius)' }}>
            <h4 style={{color:'var(--text-muted)', marginBottom:'10px', borderBottom:'1px solid #eee', paddingBottom:'5px'}}>
              Alıcı Bilgileri
            </h4>
            <p><strong>{order.buyerName}</strong></p>
            <p>{order.buyerEmail}</p>
            <p>{order.buyerPhone}</p>
          </div>

          {/* Teslimat Adresi ve Zamanı */}
          <div style={{ padding: '20px', background: 'var(--bg-body)', borderRadius: 'var(--radius)' }}>
            <h4 style={{color:'var(--text-muted)', marginBottom:'10px', borderBottom:'1px solid #eee', paddingBottom:'5px'}}>
              Teslimat Bilgileri
            </h4>
            <p>{order.addressLine}</p>
            <p>{order.city} / {order.district}</p>
            
            {/* YENİ: Tarih ve Saat Gösterimi */}
            <div style={{marginTop:'15px', paddingTop:'10px', borderTop:'1px dashed #ddd', color:'var(--primary)'}}>
              <strong>Teslimat Zamanı:</strong><br/>
              📅 {order.deliveryDate || 'Belirtilmemiş'} <br/>
              ⏰ {order.deliveryTime || 'Gün içi'}
            </div>
          </div>
        </div>

        {/* MESAJ KARTI */}
        <div style={{ background: '#FFF8E1', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid #FFECB3', marginBottom: '40px' }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
            <h4 style={{margin:0, color:'#F57F17'}}>💌 Mesaj Kartı</h4>
            {canEditNote && !isEditingNote && (
              <button onClick={() => setIsEditingNote(true)} style={{background:'none', border:'none', color:'#F57F17', textDecoration:'underline', cursor:'pointer'}}>Düzenle</button>
            )}
          </div>

          {isEditingNote ? (
            <div>
              <textarea 
                rows="3" 
                value={newNote} 
                onChange={e => setNewNote(e.target.value)} 
                style={{width:'100%', padding:'10px', marginBottom:'10px', border:'1px solid #ddd', background:'white'}}
              />
              <div style={{display:'flex', gap:'10px'}}>
                <button onClick={handleUpdateNote} className="btn btn-primary" disabled={noteLoading} style={{padding:'6px 15px', fontSize:'0.85rem'}}>Kaydet</button>
                <button onClick={() => setIsEditingNote(false)} className="btn btn-secondary" disabled={noteLoading} style={{padding:'6px 15px', fontSize:'0.85rem'}}>İptal</button>
              </div>
            </div>
          ) : (
            <p style={{fontStyle:'italic', color:'#5D4037', whiteSpace:'pre-wrap'}}>{order.notes || "(Mesaj eklenmemiş)"}</p>
          )}
        </div>

        <h3 style={{ marginBottom: '20px', color:'var(--primary)', fontFamily:'var(--font-heading)' }}>Sipariş İçeriği</h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '15px 10px' }}>Ürün</th>
                <th style={{ padding: '15px 10px' }}>Birim Fiyat</th>
                <th style={{ padding: '15px 10px' }}>Adet</th>
                <th style={{ padding: '15px 10px', textAlign:'right' }}>Tutar</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.productId || item.productName} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '15px 10px', fontWeight:'600', color:'var(--text-main)' }}>{item.productName}</td>
                  <td style={{ padding: '15px 10px' }}>{item.unitPriceTry} TL</td>
                  <td style={{ padding: '15px 10px' }}>{item.quantity}</td>
                  <td style={{ padding: '15px 10px', fontWeight:'bold', color:'var(--primary)', textAlign:'right' }}>{item.lineTotalTry} TL</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '30px', textAlign: 'right' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Genel Toplam</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
            {order.orderTotalTry} TL
          </div>
        </div>
      </div>
    </div>
  );
}