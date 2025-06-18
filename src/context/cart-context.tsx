'use client';

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  image: string;
  productId?: string; // For database sync
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  hasPendingChanges: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SET_PENDING_CHANGES'; payload: boolean };

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  syncWithDatabase: () => Promise<void>;
  syncToServer: () => Promise<void>; // Sync local changes to server
  isLoading: boolean;
  hasPendingChanges: boolean; // Track if there are unsaved changes
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);

      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
          hasPendingChanges: true
        };
      } else {
        const newItems = [...state.items, { ...action.payload, quantity: 1 }];
        return {
          ...state,
          items: newItems,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems),
          hasPendingChanges: true
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
        hasPendingChanges: true
      };
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const newItems = state.items.filter(item => item.id !== action.payload.id);
        return {
          ...state,
          items: newItems,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems),
          hasPendingChanges: true
        };
      }

      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems),
        hasPendingChanges: true
      };
    }
    
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        itemCount: 0,
        hasPendingChanges: true
      };

    case 'LOAD_CART': {
      return {
        items: action.payload,
        total: calculateTotal(action.payload),
        itemCount: calculateItemCount(action.payload),
        hasPendingChanges: false // Fresh from server
      };
    }

    case 'SET_PENDING_CHANGES': {
      return {
        ...state,
        hasPendingChanges: action.payload
      };
    }
    
    default:
      return state;
  }
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

const CART_STORAGE_KEY = 'dongypharmacy_cart';

// Helper function to safely get first image from product images
function getFirstImage(images: any): string {
  const fallback = '/images/placeholder.png';

  if (!images) return fallback;

  // If it's already an array
  if (Array.isArray(images)) {
    return images.length > 0 ? images[0] : fallback;
  }

  // If it's a string that might be JSON
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
    } catch {
      // If parsing fails, treat as single image URL
      return images || fallback;
    }
  }

  return fallback;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
    hasPendingChanges: false
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync cart with database
  const syncWithDatabase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.items) {
          console.log('Cart API Response:', data.data.items);

          // Transform database cart items to match our CartItem interface
          const cartItems = data.data.items.map((item: any) => {
            const imageUrl = getFirstImage(item.product.images);

            return {
              id: item.id,
              productId: item.productId,
              name: item.product.name,
              price: Number(item.product.salePrice || item.product.price),
              oldPrice: item.product.salePrice ? Number(item.product.price) : undefined,
              quantity: item.quantity,
              image: imageUrl
            };
          });
          dispatch({ type: 'LOAD_CART', payload: cartItems });
        }
      }
    } catch (error) {
      console.error('Error syncing cart with database:', error);
      // Fallback to localStorage
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: cartItems });
        }
      } catch (localError) {
        console.error('Error loading cart from localStorage:', localError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart on mount
  useEffect(() => {
    syncWithDatabase();
  }, []);

  // Auto-save when user leaves page (silent background sync)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && state.hasPendingChanges) {
        // Page is being hidden, try to sync silently in background
        syncToServer().catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.hasPendingChanges]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    // Ensure image is properly formatted
    const safeItem = {
      ...item,
      image: item.image || '/images/placeholder.png'
    };

    dispatch({ type: 'ADD_ITEM', payload: safeItem });
    toast.success(`Đã thêm ${item.name} vào giỏ hàng`);
  };

  const removeItem = (id: string) => {
    const item = state.items.find(item => item.id === id);

    // Remove immediately on client-side
    dispatch({ type: 'REMOVE_ITEM', payload: id });

    if (item) {
      toast.success(`Đã xóa ${item.name} khỏi giỏ hàng`);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    // Update immediately on client-side
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    // toast.success('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
  };

  // Sync local cart changes to server
  const syncToServer = async (showToast = false) => {
    if (!state.hasPendingChanges) return;

    setIsLoading(true);
    try {
      // Get current server cart
      const serverResponse = await fetch('/api/cart');
      if (!serverResponse.ok) {
        throw new Error('Failed to fetch server cart');
      }

      const serverData = await serverResponse.json();
      const serverItems = serverData.success ? serverData.data.items : [];

      // Create a map of server items for easy lookup
      const serverItemsMap = new Map(
        serverItems.map((item: any) => [item.productId, item])
      );

      // Sync each local item to server
      for (const localItem of state.items) {
        const serverItem = serverItemsMap.get(localItem.productId);

        if (!serverItem) {
          // Item doesn't exist on server, add it
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: localItem.productId,
              quantity: localItem.quantity
            })
          });
        } else if (serverItem.quantity !== localItem.quantity) {
          // Item exists but quantity is different, update it
          await fetch('/api/cart/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cartItemId: serverItem.id,
              quantity: localItem.quantity
            })
          });
        }

        // Remove from server map (remaining items will be deleted)
        serverItemsMap.delete(localItem.productId);
      }

      // Delete items that exist on server but not locally
      for (const [, serverItem] of serverItemsMap) {
        await fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItemId: serverItem.id })
        });
      }

      // Mark as synced
      dispatch({ type: 'SET_PENDING_CHANGES', payload: false });

      if (showToast) {
        toast.success('Giỏ hàng đã được đồng bộ');
      }

    } catch (error) {
      console.error('Error syncing to server:', error);
      if (showToast) {
        toast.error('Có lỗi khi đồng bộ giỏ hàng');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCartTotal = () => state.total;
  const getItemCount = () => state.itemCount;

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getCartTotal,
      getItemCount,
      syncWithDatabase,
      syncToServer,
      isLoading,
      hasPendingChanges: state.hasPendingChanges
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export type { CartItem, CartState };