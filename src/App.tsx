import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Coffee, Plus, Minus, X, Check, Trash2, ChevronLeft, UtensilsCrossed } from 'lucide-react';

// ==============================================
// 🛠 วิธีการแก้ไขข้อมูลร้าน (สำหรับเจ้าของร้าน)
// ==============================================
// 1. เปลี่ยนรูป/ชื่อ/ราคา อาหาร: เลื่อนลงไปดูที่ตัวแปร `menuItems` สามารถแก้ `name`, `price`, `image` ได้เลย
// 2. เปลี่ยนเนื้อสัตว์: ดูที่ตัวแปร `defaultMeatOptions`
// 3. เปลี่ยนโลโก้ร้าน: ค้นหาคำว่า "โลโก้ร้าน" ในส่วนของ <header> ด้านล่าง เพื่อแทรกแท็ก <img> แทนที่ของเดิม

// --- Types ---
type Category = 'main' | 'cafe';

interface MeatOption {
  id: string;
  label: string;
  extraPrice: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: Category;
  description?: string;
  meatOptions?: MeatOption[]; // ตัวเลือกเสริม (เนื้อสัตว์)
}

interface CartItem {
  uniqueId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedMeat?: MeatOption;
}

// --- Mock Data ---

// ตัวเลือกเนื้อสัตว์พื้นฐาน (สามารถเพิ่ม/แก้ราคาบวกเพิ่มได้)
const defaultMeatOptions: MeatOption[] = [
  { id: 'pork', label: 'หมูชิ้น', extraPrice: 0 },
  { id: 'chicken', label: 'ไก่', extraPrice: 0 },
  { id: 'shrimp', label: 'กุ้ง', extraPrice: 10 },
  { id: 'crispy_pork', label: 'หมูกรอบ', extraPrice: 10 },
];

const menuItems: MenuItem[] = [
  // อาหารจานหลัก (Main Dishes)
  {
    id: 'm1',
    name: 'ข้าวกะเพรา',
    price: 40, // ราคาเริ่มต้น
    category: 'main',
    description: 'ผัดกะเพรารสจัดจ้าน หอมกลิ่นคั่วกระทะ',
    image: 'Menu1.png',
    meatOptions: defaultMeatOptions,
  },
  {
    id: 'm2',
    name: 'ข้าวผัด',
    price: 40,
    category: 'main',
    description: 'ข้าวผัดหอมร่วน กลมกล่อม บีบมะนาวหน่อยอร่อยเลย',
    image: 'Menu3.png',
    meatOptions: defaultMeatOptions,
  },
  {
    id: 'm3',
    name: 'ข้าวทอดกระเทียม',
    price: 40,
    category: 'main',
    description: 'ทอดกระเทียมพริกไทยเจียวหอมๆ ราดข้าวสวยร้อนๆ',
    image: 'Menu2.png',
    meatOptions: defaultMeatOptions,
  },
  {
    id: 'm4',
    name: 'ข้าวไข่เจียว',
    price: 35,
    category: 'main',
    description: 'ไข่เจียวฟูๆ สมบูรณ์แบบ กรอบนอกนุ่มใน',
    image: 'Menu4.png'
  },

  // คาเฟ่ (Cafe)
  {
    id: 'c1',
    name: 'อเมริกาโน่เย็น',
    price: 40,
    category: 'cafe',
    image: 'Drinks1.png'
  },
  {
    id: 'c2',
    name: 'ลาเต้เย็น',
    price: 40,
    category: 'cafe',
    image: 'Drinks2.png'
  },
  {
    id: 'c3',
    name: 'สตรอว์เบอร์รีโซดา',
    price: 60,
    category: 'cafe',
    image: 'Drinks3.png'
  },
  {
    id: 'c4',
    name: 'ชามะนาว',
    price: 55,
    category: 'cafe',
    image: 'Drinks4.png'
  },
  {
    id: 'c5',
    name: 'คุกกี้',
    price: 50,
    category: 'cafe',
    image: 'Cookie.png'
  },
  {
    id: 'c6',
    name: 'บราวนี่',
    price: 60,
    category: 'cafe',
    image: 'Brownie.png'
  }
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('main');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  
  // State for Item Detail Modal
  const [selectedItemState, setSelectedItemState] = useState<{
    item: MenuItem;
    selectedMeat?: MeatOption;
    quantity: number;
  } | null>(null);

  // Prevent background scrolling for modals
  useEffect(() => {
    if (isCartOpen || showOrderSuccess || selectedItemState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isCartOpen, showOrderSuccess, selectedItemState]);

  const displayedItems = menuItems.filter(item => item.category === activeCategory);

  const openItemDetail = (item: MenuItem) => {
    setSelectedItemState({
      item,
      selectedMeat: item.meatOptions?.[0], // Default pick first meat
      quantity: 1
    });
  };

  const handleAddToCartSubmit = () => {
    if (!selectedItemState) return;
    const { item, selectedMeat, quantity } = selectedItemState;
    
    setCart(prev => {
      // สร้าง ID เฉพาะตามเมนูและเนื้อที่เลือก
      const uniqueId = selectedMeat ? `${item.id}-${selectedMeat.id}` : item.id;
      const existingItem = prev.find(c => c.uniqueId === uniqueId);
      
      if (existingItem) {
        return prev.map(c => c.uniqueId === uniqueId ? { ...c, quantity: c.quantity + quantity } : c);
      }
      return [...prev, { uniqueId, menuItem: item, quantity, selectedMeat }];
    });
    
    setSelectedItemState(null); // Close modal
  };

  const updateCartQuantity = (uniqueId: string, change: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.uniqueId === uniqueId) {
          const newQty = item.quantity + change;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (uniqueId: string) => {
    setCart(prev => prev.filter(item => item.uniqueId !== uniqueId));
  };

  const cartTotalElements = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cart.reduce((acc, item) => {
    const itemPrice = item.menuItem.price + (item.selectedMeat?.extraPrice || 0);
    return acc + (itemPrice * item.quantity);
  }, 0);

  const handleOrder = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setShowOrderSuccess(true);
    setCart([]);
    setTimeout(() => setShowOrderSuccess(false), 3000);
  };

  // Helper for Modal Pricing
  const modalItemPrice = selectedItemState ? selectedItemState.item.price + (selectedItemState.selectedMeat?.extraPrice || 0) : 0;
  const modalTotalPrice = selectedItemState ? modalItemPrice * selectedItemState.quantity : 0;

  return (
    <div className="min-h-[100dvh] w-full flex justify-center bg-gray-200">
      {/* Mobile Constraint Container - ปรับให้ Responsive กับมือถือด้วย w-full ปกติ */}
      <div className="w-full sm:max-w-[480px] bg-brand-bg relative shadow-2xl flex flex-col font-sans min-h-[100dvh]">
        
        {/* Header */}
        <header className="sticky top-0 z-30 bg-brand-bg/90 backdrop-blur-md px-5 py-3.5 flex justify-between items-center border-b border-gray-200/50">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-brand-black tracking-tight leading-none mb-1">
              ร้านลุงดำ
            </h1>
            <p className="text-[11px] text-brand-gray font-semibold uppercase tracking-wider">Food & Cafe</p>
          </div>
          <div className="w-12 h-12 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center overflow-hidden p-1">
            <img 
              src="logo.png" 
              alt="โลโก้ร้าน" 
              className="w-full h-full object-contain rounded-full bg-[#f8f9fa]"
              onError={(e) => {
                // หากยังไม่ได้อัปโหลดรูป logo.png จะใช้รูปชั่วคราว
                e.currentTarget.src = 'Logo.png';
              }}
            />
          </div>
        </header>

        <main className="px-4 py-6 flex flex-col pb-32">
          {/* Category Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setActiveCategory('main')}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all border-2 ${
                activeCategory === 'main'
                  ? 'bg-brand-black text-white border-brand-black shadow-md'
                  : 'bg-white text-brand-black border-transparent shadow-sm'
              }`}
            >
              <UtensilsCrossed size={20} className={activeCategory === 'main' ? 'text-white' : 'text-brand-black'} strokeWidth={2.5} />
              <span className="text-sm font-semibold">วันนี้กินอะไรดี</span>
            </button>
            <button
              onClick={() => setActiveCategory('cafe')}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all border-2 ${
                activeCategory === 'cafe'
                  ? 'bg-brand-black text-white border-brand-black shadow-md'
                  : 'bg-white text-brand-black border-transparent shadow-sm'
              }`}
            >
              <Coffee size={20} className={activeCategory === 'cafe' ? 'text-white' : 'text-brand-black'} strokeWidth={2.5} />
              <span className="text-sm font-semibold">คาเฟ่ / ของกินเล่น</span>
            </button>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-bold text-brand-black">
              {activeCategory === 'main' ? 'อาหารจานหลัก (Main Dish)' : 'เครื่องดื่มและของหวาน (Cafe)'}
            </h2>
            <p className="text-xs text-brand-gray mt-0.5">เมนูสุดพิเศษจากร้านลุงดำ</p>
          </div>

          {/* Menu Grid */}
          <motion.div 
            key={activeCategory}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            {displayedItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => openItemDetail(item)}
                className="bg-white rounded-[1.25rem] p-2.5 flex flex-col shadow-sm border border-gray-100/80 group cursor-pointer active:scale-95 transition-transform"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-3">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Badges for customization */}
                  {item.meatOptions && (
                    <div className="absolute bottom-1.5 left-1.5 bg-brand-black/85 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full font-medium shadow-sm">
                      เลือกเนื้อได้
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1 px-1">
                  <h3 className="font-semibold text-brand-black text-[13px] sm:text-sm line-clamp-2 leading-snug min-h-[2.4rem]">
                    {item.name}
                  </h3>
                  
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="font-bold text-sm text-brand-black">
                      {item.meatOptions && <span className="text-[10px] font-medium text-brand-gray mr-0.5">เริ่ม</span>}
                      ฿{item.price}
                    </span>
                    <button className="w-7 h-7 rounded-full bg-brand-bg text-brand-black flex items-center justify-center shadow-sm">
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </main>

        {/* Floating Action Button (Shows when cart has items) */}
        <AnimatePresence>
          {cartTotalElements > 0 && !isCartOpen && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              // ใช้ fixed ผูกกับหน้าจอโทรศัพท์
              className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-40"
            >
              <button
                onClick={() => setIsCartOpen(true)}
                className="w-full bg-brand-black text-white rounded-[2rem] p-4 px-6 shadow-xl shadow-black/20 flex justify-between items-center active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="relative bg-white/20 p-2.5 rounded-full">
                    <ShoppingBag size={20} className="text-white" />
                  </div>
                  <div className="flex flex-col items-start leading-none text-left">
                    <span className="text-[11px] text-gray-300 font-medium mb-1 pt-0.5">ตะกร้าของคุณ</span>
                    <span className="font-bold text-sm text-white">{cartTotalElements} รายการ</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-white">฿{cartTotalPrice}</span>
                  <div className="w-8 h-8 rounded-full bg-white text-brand-black flex items-center justify-center">
                    <ChevronLeft size={20} className="rotate-180" />
                  </div>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Option Selection Bottom Sheet (Item Detail) */}
        <AnimatePresence>
          {selectedItemState && (
            <>
              {/* ฉากหลังสีเทาดำครอบทั้งจอ */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedItemState(null)}
                className="fixed inset-0 bg-brand-black/50 backdrop-blur-sm z-50 rounded-b-none"
              />
              {/* แถบตัวเลือกที่เลื่อนขึ้นมา */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                className="fixed inset-x-0 bottom-0 w-full max-w-[480px] mx-auto max-h-[85dvh] bg-brand-bg z-50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
              >
                {/* ลดขนาดภาพลงให้ Bottom Sheet ดูไม่ลึก ยืดตามสัดส่วน */}
                <div className="relative h-[180px] sm:h-[220px] w-full bg-gray-100 flex-shrink-0">
                  <img 
                    src={selectedItemState.item.image} 
                    alt={selectedItemState.item.name}
                    className="w-full h-full object-cover"
                  />
                  <button 
                    onClick={() => setSelectedItemState(null)}
                    className="absolute top-4 right-4 p-2 bg-white/90 text-brand-black shadow-md rounded-full transition-colors active:scale-90"
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200/50">
                    <h2 className="font-bold text-xl sm:text-2xl text-brand-black leading-tight mb-1">
                      {selectedItemState.item.name}
                    </h2>
                    {selectedItemState.item.description && (
                      <p className="text-sm text-brand-gray">{selectedItemState.item.description}</p>
                    )}
                  </div>

                  {/* Meat Options List */}
                  {selectedItemState.item.meatOptions && (
                    <div className="p-4 pt-3">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-[15px] text-brand-black">เนื้อสัตว์ / ทางเลือก</h3>
                        <span className="text-[10px] font-semibold text-brand-gray bg-gray-200/60 px-2 py-0.5 rounded">เลือก 1 อย่าง</span>
                      </div>
                      
                      <div className="space-y-2">
                        {selectedItemState.item.meatOptions.map(meat => (
                          <div 
                            key={meat.id} 
                            onClick={() => setSelectedItemState({ ...selectedItemState, selectedMeat: meat })}
                            className={`flex items-center justify-between p-3.5 border-2 rounded-[1rem] cursor-pointer transition-colors ${
                              selectedItemState.selectedMeat?.id === meat.id 
                                ? 'border-brand-black bg-white shadow-sm' 
                                : 'border-gray-200/60 bg-white/50 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                                selectedItemState.selectedMeat?.id === meat.id ? 'border-brand-black' : 'border-gray-300'
                              }`}>
                                {selectedItemState.selectedMeat?.id === meat.id && (
                                  <div className="w-[8px] h-[8px] rounded-full bg-brand-black" />
                                )}
                              </div>
                              <span className="font-medium text-[15px] sm:text-sm text-brand-black">{meat.label}</span>
                            </div>
                            <span className="text-brand-gray text-[13px] font-medium">
                              {meat.extraPrice > 0 ? `+฿${meat.extraPrice}` : 'ฟรี'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Spacer for bottom bar margin */}
                  <div className="h-[90px]" />
                </div>

                {/* Bottom Add Bar fixed inside modal container */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] flex flex-col gap-4">
                  <div className="flex gap-3 sm:gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center bg-brand-bg rounded-[1.1rem] border border-gray-100 p-1 flex-shrink-0">
                      <button 
                        onClick={() => setSelectedItemState({...selectedItemState, quantity: Math.max(1, selectedItemState.quantity - 1)})}
                        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-white text-brand-black rounded-[0.8rem] shadow-[0_2px_4px_rgba(0,0,0,0.02)] active:scale-95 transition-transform"
                      >
                        <Minus size={16} strokeWidth={3} />
                      </button>
                      <span className="w-8 sm:w-10 text-center font-bold text-lg text-brand-black">
                        {selectedItemState.quantity}
                      </span>
                      <button 
                        onClick={() => setSelectedItemState({...selectedItemState, quantity: selectedItemState.quantity + 1})}
                        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-white text-brand-black rounded-[0.8rem] shadow-[0_2px_4px_rgba(0,0,0,0.02)] active:scale-95 transition-transform"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>

                    <button 
                      onClick={handleAddToCartSubmit}
                      className="flex-1 bg-brand-black text-white font-bold rounded-[1.1rem] text-[15px] flex justify-between items-center px-5 active:scale-95 transition-transform shadow-lg shadow-black/10"
                    >
                      <span className="pt-0.5">เพิ่มลงตะกร้า</span>
                      <span className="pt-0.5">฿{modalTotalPrice}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile Cart Slider Modal (Responsive) */}
        <AnimatePresence>
          {isCartOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCartOpen(false)}
                className="fixed inset-0 bg-brand-black/50 backdrop-blur-sm z-50 rounded-b-none"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                className="fixed inset-x-0 bottom-0 top-10 sm:top-16 w-full max-w-[480px] mx-auto bg-brand-bg z-50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
              >
                {/* Drag Handle Indicator */}
                <div className="w-full flex justify-center pt-3 pb-1">
                  <div className="w-12 h-[5px] bg-gray-300 rounded-full" />
                </div>

                <div className="flex justify-between items-center px-5 sm:px-6 py-3">
                  <h2 className="font-bold text-[22px] text-brand-black pt-1">ออร์เดอร์ของฉัน</h2>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 bg-white text-brand-black shadow-sm rounded-full transition-colors active:scale-90 border border-gray-100"
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-brand-gray px-6 pb-20">
                    <ShoppingBag size={56} className="mb-4 opacity-20 text-brand-black" />
                    <p className="text-lg font-medium text-brand-black">ตะกร้าว่างเปล่า</p>
                    <p className="text-[13px] mt-1.5 text-center text-brand-gray">ดูเหมือนว่าคุณจะยังไม่ได้เลือกอาหารเลย<br/>กลับไปดูเมนูกันเถอะ</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-8 px-8 py-3 bg-brand-black text-white rounded-full font-bold shadow-md active:scale-95 transition-transform"
                    >
                      เลือกอาหาร
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-2 space-y-3">
                      {cart.map(item => (
                        <div key={item.uniqueId} className="flex gap-3.5 bg-white p-2.5 sm:p-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-100/50">
                          <img 
                            src={item.menuItem.image} 
                            alt={item.menuItem.name} 
                            className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-[0.8rem] object-cover bg-gray-50"
                          />
                          <div className="flex-1 flex flex-col py-0.5">
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <h4 className="font-bold text-brand-black leading-tight text-[13px] sm:text-sm">{item.menuItem.name}</h4>
                                {item.selectedMeat && (
                                  <p className="text-[10px] sm:text-[11px] text-brand-gray mt-1 font-medium bg-brand-bg w-fit px-2 py-0.5 rounded">
                                    • {item.selectedMeat.label} {item.selectedMeat.extraPrice > 0 ? `(+฿${item.selectedMeat.extraPrice})` : ''}
                                  </p>
                                )}
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.uniqueId)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="mt-auto flex items-center justify-between pt-2">
                              <span className="text-brand-black font-bold text-[15px]">
                                ฿{(item.menuItem.price + (item.selectedMeat?.extraPrice || 0)) * item.quantity}
                              </span>
                              <div className="flex items-center bg-brand-bg rounded-lg border border-gray-200/60 p-0.5">
                                <button 
                                  onClick={() => updateCartQuantity(item.uniqueId, -1)}
                                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-white text-brand-black rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] active:scale-95"
                                >
                                  <Minus size={13} strokeWidth={2.5} />
                                </button>
                                <span className="w-7 text-center font-bold text-[13px] text-brand-black">{item.quantity}</span>
                                <button 
                                  onClick={() => updateCartQuantity(item.uniqueId, 1)}
                                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-brand-black text-white rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] active:scale-95"
                                >
                                  <Plus size={13} strokeWidth={2.5} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="px-5 py-5 bg-white border-t border-gray-100 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                      <div className="flex justify-between items-center mb-5">
                        <span className="font-semibold text-brand-gray text-sm">ยอดรวมชำระเงิน</span>
                        <span className="font-bold text-2xl sm:text-3xl text-brand-black">฿{cartTotalPrice}</span>
                      </div>
                      <button 
                        onClick={handleOrder}
                        className="w-full bg-brand-black text-white font-bold py-3.5 sm:py-4 rounded-full text-base sm:text-lg shadow-xl shadow-black/20 flex justify-center items-center gap-2 active:scale-95 transition-transform"
                      >
                        ยืนยันและสั่งอาหาร
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Success Toast / Overlay (Fixed for full screen centering) */}
        <AnimatePresence>
          {showOrderSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-brand-black/60 backdrop-blur-sm flex items-center justify-center p-5"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-brand-bg rounded-[2rem] p-8 w-full max-w-[360px] text-center shadow-2xl relative overflow-hidden"
              >
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full opacity-50 blur-xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full opacity-50 blur-xl" />
                
                <div className="w-20 h-20 bg-brand-black text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10">
                  <Check size={40} className="stroke-[3]" />
                </div>
                <h2 className="text-2xl font-bold text-brand-black mb-2 relative z-10 pt-1">สั่งอาหารสำเร็จ!</h2>
                <p className="text-brand-gray mb-6 text-[13px] leading-relaxed relative z-10">ลุงดำได้รับออร์เดอร์ของคุณแล้ว<br/>กำลังตั้งใจทำให้อย่างสุดฝีมือ รอสักครู่นะครับ</p>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative z-10">
                  <span className="text-[11px] text-brand-gray font-semibold block mb-1">หมายเลขคิวของคุณ</span>
                  <span className="font-mono font-bold text-3xl text-brand-black tracking-widest leading-none pt-1">
                    A{Math.floor(10 + Math.random() * 90)}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
