import { useStore } from '../store/useStore';
import type { MenuItem } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AddMenuModal } from '../components/AddMenuModal';
import { ConfirmModal } from '../components/ConfirmModal';

export const InventoryPage = () => {
  const menu = useStore((state) => state.menu);
  const toggleMenuItem = useStore((state) => state.toggleMenuItem);
  const seedMenu = useStore((state) => state.seedMenu);
  const deleteMenuItem = useStore((state) => state.deleteMenuItem);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedMenu();
    } finally {
      setIsSeeding(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditItem(null);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteMenuItem(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">คลังสินค้า (Live Inventory)</h2>
          <p className="text-text-muted mt-1">จัดการสถานะเมนูแบบเรียลไทม์</p>
        </div>
        <div className="flex items-center gap-3">
          {menu.length === 0 && (
            <button 
              onClick={handleSeed}
              disabled={isSeeding}
              className="bg-secondary hover:bg-secondary/80 text-primary px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Database size={18} />
              {isSeeding ? 'กำลังเพิ่ม...' : 'เพิ่มข้อมูลตั้งต้น'}
            </button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="bg-primary hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
          >
            <Plus size={18} strokeWidth={2.5} />
            เพิ่มเมนูใหม่
          </motion.button>
        </div>
      </header>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
        {menu.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted pt-20">
            <Database size={48} className="mb-4 opacity-50 text-secondary" />
            <p className="font-bold text-lg">ไม่พบเมนูในระบบ</p>
            <p className="text-sm mt-1">คลิกปุ่ม "เพิ่มเมนูใหม่" เพื่อเริ่มเพิ่มเมนู</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {menu.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -4 }}
                  className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group ${
                    item.isAvailable 
                      ? 'border-secondary/30 bg-white hover:border-secondary shadow-sm' 
                      : 'border-gray-200 bg-gray-50/50'
                  }`}
                >
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-primary hover:bg-beige text-text-muted hover:text-primary transition-all shadow-sm"
                      title="แก้ไข"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-red-400 hover:bg-red-50 text-text-muted hover:text-red-500 transition-all shadow-sm"
                      title="ลบ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className={`w-20 h-20 object-cover rounded-xl ${!item.isAvailable && 'opacity-50 grayscale'}`}
                  />
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg leading-tight ${!item.isAvailable && 'text-gray-500 line-through'}`}>
                      {item.name}
                    </h3>
                    <p className="text-primary font-bold mt-1">฿{item.price}</p>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-sm font-bold ${item.isAvailable ? 'text-[#8C6239]' : 'text-gray-400'}`}>
                        {item.isAvailable ? 'พร้อมขาย' : 'หมดชั่วคราว'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={item.isAvailable}
                          onChange={() => toggleMenuItem(item.id)}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                      </label>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddMenuModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditItem(null);
        }}
        editItem={editItem}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="ยืนยันการลบเมนู"
        message={`คุณต้องการลบ "${deleteTarget?.name}" ออกจากระบบใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        confirmLabel="ลบเมนู"
        cancelLabel="ยกเลิก"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
