// app/[lang]/cart/page.tsx
'use client';
import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContextNext';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Button from 'react-bootstrap/Button';

const CartPage = () => {
  const { cartItems, cartItemCount, removeFromCart, updateQuantity, clearCart } = useCart();
  const params = useParams();
  const router = useRouter();
  const { user, token, showLogin, onRequireLogin } = useAuth();
  // Check if user is authenticated (has token and user data)
  const isAuthenticated = !!token && !!user;
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );

   // Handle checkout button click
  const handleCheckout = () => {
    if (!token || !user) {
        //console.log("Not authenticated")
      showLogin();
      //onRequireLogin?.(); //On required login is possibly undefined
      return;
    }
    
    // Proceed with checkout for authenticated users
    router.push(`/${params.lang}/checkout`);
    //toast.success('Proceeding to payment');
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Your Cart ({cartItemCount} items)</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <h3>Your cart is empty</h3>
          <Link href={`/${params.lang}`} className="btn btn-primary mt-3">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-lg-8">
              {cartItems.map(item => (
                <div key={item.ID} className="card mb-3">
                  <div className="row g-0">
                    
                    <div className="col-md-4">
                        <Link href={`/${params.lang}/product/${item.Slug || item.ID}`}>
                      <img 
                        src={API_URL+item.images?.[0]?.url || '/placeholder-product.jpg'} 
                        alt={item.name}
                        //fill
                        className="img-fluid rounded-start"
                        style={{ height: '200px', objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      </Link>
                    </div>
                   
                    <div className="col-md-6">
                      <div className="card-body">
                         <Link 
                          href={`/${params.lang}/product/${item.Slug || item.ID}`}
                          className="text-decoration-none text-dark"
                        >
                          <h5 className="card-title">{item.name}</h5>
                        </Link>
                        
                        <p className="card-text">${item.price.toFixed(2)}</p>
                        
                        <div className="d-flex align-items-center mb-3">
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => updateQuantity(item.ID, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="mx-3">{item.quantity}</span>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => updateQuantity(item.ID, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => removeFromCart(item.ID)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline-danger" 
                onClick={clearCart}
                className="mt-3"
              >
                Clear Cart
              </Button>
            </div>
            
            <div className="col-lg-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Order Summary</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal ({cartItemCount} items)</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <Button 
                    //href={`/${params.lang}/checkout`} 
                    onClick={handleCheckout}
                    className="btn btn-primary w-100 mt-3"
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <Link 
                    href={`/${params.lang}`} 
                    className="btn btn-outline-secondary w-100 mt-2"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;