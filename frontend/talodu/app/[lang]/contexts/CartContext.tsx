// app/[lang]/contexts/CartContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartItemCount: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on initial render 
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

   // Load cart from cart state before language switch
  useEffect(() => {
    const langsavedCart = localStorage.getItem('langCart');
    if (langsavedCart) {
      setCartItems(JSON.parse(langsavedCart));
    }
  }, []);


  // Save cart to localStorage whenever it changes
  useEffect(() => {
   localStorage.setItem('cart', JSON.stringify(cartItems));
    
  }, [cartItems]);


  const addToCart = (product: Product) => {
   
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.ID === product.ID);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.ID === product.ID 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      
      return [...prevItems, { ...product, quantity: 1 }];
    });

  };

  const removeFromCart = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.ID !== productId));
   
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.ID === productId ? { ...item, quantity } : item
      )
    );
    
  };

  const clearCart = () => {
    setCartItems([]);
    
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        cartItemCount, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};