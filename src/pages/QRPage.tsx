import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Printer, PlusCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export const QRPage = () => {
  const [tableNumber, setTableNumber] = useState('1');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const createSession = useStore((state) => state.createSession);

  // Customer app URL. In production this would be an env var.
  const CUSTOMER_APP_URL = 'http://localhost:5173';
  const qrValue = sessionId ? `${CUSTOMER_APP_URL}/${sessionId}` : '';

  const handleGenerate = async () => {
    if (!tableNumber) return;
    setIsGenerating(true);
    try {
      const newSessionId = await createSession(tableNumber);
      setSessionId(newSessionId);
    } catch (e) {
      console.error("Failed to create session", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 print:hidden">
        <h2 className="text-3xl font-bold text-primary tracking-tight">สร้างคิวอาร์โค้ด (QR Generator)</h2>
        <p className="text-text-muted mt-1">สร้างคิวอาร์โค้ดประจำโต๊ะ สำหรับให้ลูกค้าสแกนสั่งอาหาร (แบบใช้ครั้งเดียว)</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block">
        
        {/* Controls Section - Hidden when printing */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 print:hidden">
          <label className="block text-sm font-bold text-primary mb-2">
            หมายเลขโต๊ะ
          </label>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => {
              setTableNumber(e.target.value);
              setSessionId(null); // Reset session if table changes
            }}
            className="w-full text-2xl p-4 border-2 border-gray-200 rounded-xl focus:border-secondary focus:ring-0 transition-colors mb-6 font-bold"
            placeholder="เช่น 1, 2, 3..."
          />

          {!sessionId ? (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !tableNumber}
              className="w-full bg-secondary hover:bg-[#c2a27b] text-primary p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              <PlusCircle size={20} />
              {isGenerating ? 'กำลังสร้าง...' : 'เปิดโต๊ะ & สร้าง QR Code'}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 text-green-700 rounded-xl font-medium text-center border border-green-200">
                สร้างคิวอาร์โค้ดสำเร็จ!
              </div>
              <button
                onClick={handlePrint}
                className="w-full bg-primary text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-sm"
              >
                <Printer size={20} />
                พิมพ์คิวอาร์โค้ด
              </button>
              <button
                onClick={() => setSessionId(null)}
                className="w-full bg-gray-100 text-gray-600 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
              >
                สร้างสำหรับโต๊ะอื่น
              </button>
            </div>
          )}
        </div>

        {/* QR Preview Section - Printed exactly as seen */}
        <div className="flex items-center justify-center print:items-start print:justify-start">
          {sessionId ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-3xl shadow-lg print:shadow-none print:p-0 flex flex-col items-center"
            >
              <h1 className="text-2xl font-bold text-primary mb-2">สแกนเพื่อสั่งอาหาร</h1>
              <p className="text-text-muted mb-6 font-medium">โต๊ะ {tableNumber}</p>
              
              <div className="p-4 border-4 border-primary rounded-2xl bg-white">
                <QRCodeSVG 
                  value={qrValue} 
                  size={200}
                  level="H"
                  fgColor="#3E2723"
                  imageSettings={{
                    src: "https://placehold.co/100x100/3E2723/FFF?text=Cafe",
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>
              
              <p className="text-sm text-gray-400 mt-6 font-mono max-w-[200px] truncate">{qrValue}</p>
            </motion.div>
          ) : (
            <div className="bg-cream/50 p-8 rounded-3xl border-2 border-dashed border-secondary/30 flex flex-col items-center justify-center text-center h-full print:hidden">
              <div className="text-secondary mb-4 opacity-50">
                <PlusCircle size={48} />
              </div>
              <p className="text-text-muted font-medium">ระบุหมายเลขโต๊ะแล้วกด "เปิดโต๊ะ"<br/>เพื่อสร้าง QR Code</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
