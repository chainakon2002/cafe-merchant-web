import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, ImagePlus, Trash2, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { MenuItem } from '../store/useStore';

interface AddMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: MenuItem | null;
}

const CATEGORIES = [
  { id: 'c1', name: 'Coffee' },
  { id: 'c2', name: 'Non-Coffee' },
  { id: 'c3', name: 'Bakery' },
  { id: 'c4', name: 'Signature' },
];

export const AddMenuModal = ({ isOpen, onClose, editItem }: AddMenuModalProps) => {
  const addMenuItem = useStore((s) => s.addMenuItem);
  const updateMenuItem = useStore((s) => s.updateMenuItem);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('c1');
  const [isPopular, setIsPopular] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form when editing
  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setDescription(editItem.description);
      setPrice(String(editItem.price));
      setCategoryId(editItem.categoryId);
      setIsPopular(editItem.isPopular ?? false);
      setImagePreview(editItem.image);
      setImageFile(null);
    } else {
      resetForm();
    }
  }, [editItem, isOpen]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId('c1');
    setIsPopular(false);
    setImageFile(null);
    setImagePreview(null);
    setError('');
  };

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB');
      return;
    }
    setError('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('กรุณากรอกชื่อเมนู'); return; }
    if (!price || Number(price) <= 0) { setError('กรุณากรอกราคาที่ถูกต้อง'); return; }

    setIsSubmitting(true);
    try {
      if (editItem) {
        await updateMenuItem(editItem.id, {
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          categoryId,
          isPopular,
          isAvailable: editItem.isAvailable,
        }, imageFile || undefined);
      } else {
        await addMenuItem({
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          categoryId,
          isPopular,
          isAvailable: true,
        }, imageFile || undefined);
      }
      resetForm();
      onClose();
    } catch (err) {
      setError('เกิดข้อผิดพลาด: ' + (err instanceof Error ? err.message : 'ไม่ทราบสาเหตุ'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl rounded-t-3xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-primary">
                  {editItem ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}
                </h2>
                <p className="text-sm text-text-muted mt-0.5">
                  {editItem ? 'แก้ไขข้อมูลและรูปภาพเมนู' : 'กรอกข้อมูลเมนูและอัปโหลดรูปภาพ'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-text-muted hover:text-primary"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image Upload Area */}
              <div>
                <label className="block text-sm font-bold text-primary mb-2">รูปภาพเมนู</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative w-full aspect-[16/10] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden group ${
                    isDragging
                      ? 'border-primary bg-beige scale-[1.02]'
                      : imagePreview
                        ? 'border-secondary/50 hover:border-primary'
                        : 'border-gray-300 hover:border-secondary bg-cream'
                  }`}
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                          <span className="bg-white/90 backdrop-blur-sm text-primary px-4 py-2 rounded-xl font-bold text-sm shadow-lg">
                            เปลี่ยนรูป
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageFile(null);
                              setImagePreview(editItem?.image || null);
                            }}
                            className="bg-red-500/90 backdrop-blur-sm text-white p-2 rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted">
                      <div className={`p-4 rounded-2xl mb-3 transition-all duration-300 ${isDragging ? 'bg-primary/10 scale-110' : 'bg-secondary/20'}`}>
                        {isDragging ? <Upload size={32} className="text-primary" /> : <ImagePlus size={32} className="text-secondary" />}
                      </div>
                      <p className="font-bold text-sm">
                        {isDragging ? 'ปล่อยเพื่ออัปโหลด' : 'ลากไฟล์มาวางที่นี่'}
                      </p>
                      <p className="text-xs mt-1 text-text-muted/70">หรือคลิกเพื่อเลือกไฟล์ (สูงสุด 5MB)</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-primary mb-2">ชื่อเมนู</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น Iced Latte, Matcha Frappe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-cream/50 text-primary placeholder:text-text-muted/50 font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-primary mb-2">รายละเอียด</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="อธิบายเมนูสั้นๆ..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-cream/50 text-primary placeholder:text-text-muted/50 font-medium resize-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-bold text-primary mb-2">ราคา (฿)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-cream/50 text-primary placeholder:text-text-muted/50 font-medium"
                />
              </div>

              {/* Category Row (Tabs) */}
              <div>
                <label className="block text-sm font-bold text-primary mb-2">หมวดหมู่</label>
                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
                  {CATEGORIES.map(cat => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                        categoryId === cat.id
                          ? 'bg-beige-active text-primary shadow-sm border border-secondary/20'
                          : 'bg-transparent text-text-muted hover:bg-cream border border-transparent'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Toggle */}
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-secondary cursor-pointer transition-colors bg-cream/30">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-gray-300 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-[18px] relative shrink-0 transition-colors" />
                <div>
                  <span className="font-bold text-sm text-primary">เมนูยอดนิยม</span>
                  <p className="text-xs text-text-muted">แสดงเมนูนี้ในหมวดยอดนิยม</p>
                </div>
              </label>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-text-muted hover:bg-gray-50 font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    editItem ? 'บันทึกการแก้ไข' : 'เพิ่มเมนู'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


