import { create } from 'zustand';
import { collection, onSnapshot, doc, updateDoc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const uploadImageToImgBB = async (imageFile: File): Promise<string> => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('ImgBB API Key is missing in .env');
  }

  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (data.success) {
    return data.data.url;
  } else {
    throw new Error(data.error?.message || 'Failed to upload image to ImgBB');
  }
};

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  isPopular?: boolean;
  isAvailable: boolean;
}

export interface OrderItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  options: {
    type: string;
    sweetness: number;
    toppings: string[];
  };
}

export interface Order {
  id: string;
  status: 'received' | 'preparing' | 'served' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  tableId: string;
  sessionId?: string;
  createdAt: string;
}

export interface TableSession {
  id: string;
  tableNumber: string;
  status: 'active' | 'closed';
  createdAt: string;
}

interface AppState {
  menu: MenuItem[];
  orders: Order[];
  isConnecting: boolean;
  connect: () => void;
  toggleMenuItem: (id: string) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  seedMenu: () => Promise<void>;
  addMenuItem: (item: Omit<MenuItem, 'id' | 'image'>, imageFile?: File) => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<Omit<MenuItem, 'id'>>, imageFile?: File) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  
  // Session / Tables
  activeSessions: TableSession[];
  createSession: (tableNumber: string) => Promise<string>;
  closeSession: (sessionId: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  menu: [],
  orders: [],
  activeSessions: [],
  isConnecting: false,
  
  connect: () => {
    if (get().isConnecting) return;
    set({ isConnecting: true });

    // Listen to Menu collection
    onSnapshot(collection(db, 'menu'), (snapshot) => {
      const menuData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
      set({ menu: menuData });
    });

    // Listen to Orders collection
    onSnapshot(collection(db, 'orders'), (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      set({ orders: ordersData });
    });

    // Listen to Sessions collection
    onSnapshot(collection(db, 'sessions'), (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TableSession));
      set({ activeSessions: sessionsData.filter(s => s.status === 'active') });
    });
  },

  toggleMenuItem: async (id) => {
    const item = get().menu.find(i => i.id === id);
    if (item) {
      const itemRef = doc(db, 'menu', id);
      await updateDoc(itemRef, { isAvailable: !item.isAvailable });
    }
  },

  updateOrderStatus: async (id, status) => {
    const orderRef = doc(db, 'orders', id);
    await updateDoc(orderRef, { status });
  },

  seedMenu: async () => {
    const mockMenu = [
      { id: 'm1', name: 'Iced Latte', description: 'ผสมผสานความเข้มข้นของเอสเพรสโซช็อตระดับพรีเมียม เข้ากับความหวานมันนุ่มนวลของนมสดแท้ 100% เสิร์ฟแยกชั้นสวยงาม มอบรสชาติที่กลมกล่อม ลื่นคอ เหมาะสำหรับคนชอบกาแฟรสนุ่ม', price: 80, image: '/images/Iced Latte.png', categoryId: 'c1', isAvailable: true },
      { id: 'm2', name: 'Matcha Latte', description: 'รสสัมผัสเข้มข้นจากเกียวโต นุ่มนวล กลมกล่อม สายมัทฉะห้ามพลาด', price: 90, image: '/images/Matcha Latte.png', categoryId: 'c1', isAvailable: true },
      { id: 'm3', name: 'Premium Matcha', description: 'Premium Uji matcha with fresh milk.', price: 120, image: 'https://placehold.co/400x400/F5EBE1/8C6239?text=Matcha', categoryId: 'c2', isAvailable: true },
      { id: 'm4', name: 'Croissant', description: 'Butter croissant.', price: 75, image: 'https://placehold.co/400x400/F5EBE1/8C6239?text=Croissant', categoryId: 'c3', isAvailable: true },
      { id: 'm5', name: 'Dirty Coffee', description: 'Cold milk topped with warm espresso shot.', price: 130, image: 'https://placehold.co/400x400/F5EBE1/8C6239?text=Dirty', categoryId: 'c4', isAvailable: true },
    ];
    for (const item of mockMenu) {
      await setDoc(doc(db, 'menu', item.id), item);
    }
  },

  addMenuItem: async (item, imageFile) => {
    let imageUrl = `https://placehold.co/400x400/F5EBE1/8C6239?text=${encodeURIComponent(item.name)}`;

    if (imageFile) {
      try {
        imageUrl = await uploadImageToImgBB(imageFile);
      } catch (error) {
        console.error('ImgBB upload failed, falling back to base64', error);
        // Fallback: convert image to base64 data URL
        imageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }
    }

    // Add menu item to Firestore with the image URL
    await addDoc(collection(db, 'menu'), {
      ...item,
      image: imageUrl,
    });
  },

  updateMenuItem: async (id, updates, imageFile) => {
    const menuRef = doc(db, 'menu', id);
    const updateData: Record<string, unknown> = { ...updates };

    if (imageFile) {
      try {
        updateData.image = await uploadImageToImgBB(imageFile);
      } catch (error) {
        console.error('ImgBB upload failed, falling back to base64', error);
        // Fallback: convert image to base64 data URL
        updateData.image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }
    }

    await updateDoc(menuRef, updateData);
  },

  deleteMenuItem: async (id) => {
    await deleteDoc(doc(db, 'menu', id));
  },

  createSession: async (tableNumber: string) => {
    const sessionData = {
      tableNumber,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'sessions'), sessionData);
    return docRef.id;
  },

  closeSession: async (sessionId: string) => {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, { status: 'closed' });
  }
}));


