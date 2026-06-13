import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { Receipt, CheckCircle, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';

export const TablesPage = () => {
  const activeSessions = useStore((state) => state.activeSessions);
  const closeSession = useStore((state) => state.closeSession);

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">จัดการโต๊ะ (Tables & Billing)</h2>
          <p className="text-text-muted mt-1">เช็คบิลและปิดโต๊ะเมื่อลูกค้าทานเสร็จ</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-secondary/20 flex items-center gap-2">
          <span className="text-sm font-bold text-primary">โต๊ะที่กำลังเปิด:</span>
          <span className="bg-primary text-white px-2 py-0.5 rounded-md text-sm font-bold">{activeSessions?.length || 0}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        {!activeSessions || activeSessions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="text-secondary mb-4 opacity-50">
              <CheckCircle size={48} />
            </div>
            <p className="text-xl font-bold text-primary mb-2">ยังไม่มีโต๊ะที่เปิดอยู่</p>
            <p className="text-text-muted">คุณสามารถเปิดโต๊ะได้ที่เมนู "สร้างคิวอาร์โค้ด"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {activeSessions.map((session) => (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-secondary/20 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-primary">โต๊ะ {session.tableNumber}</h3>
                        <p className="text-xs text-text-muted mt-1 font-mono truncate max-w-[150px]">ID: {session.id}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-secondary bg-beige px-2 py-1 rounded-lg">
                        <Clock size={14} />
                        เปิดเมื่อ {dayjs(session.createdAt).format('HH:mm')}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (window.confirm(`ยืนยันการเช็คบิล โต๊ะ ${session.tableNumber}?`)) {
                        closeSession(session.id);
                      }
                    }}
                    className="w-full mt-6 bg-primary hover:bg-black text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Receipt size={18} />
                    เช็คบิล / ปิดโต๊ะ
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};



