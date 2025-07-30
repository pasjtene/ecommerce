// app/[lang]/checkout/page.tsx
'use client';
import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContextNext';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { useCurrency } from '../contexts/CurrencyContext';

const CheckoutPage = () => {
  const { cartItems, cartItemCount } = useCart();
  const { currency, currencyRate, currencySymbol, formatPrice } = useCurrency();
  const { user, token, showLogin, onRequireLogin } = useAuth();
  const params = useParams();
  const router = useRouter();

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );

  // Handle checkout button click
  const handleCheckout = () => {
    if (!token || !user) {
      showLogin();
      // onRequireLogin?.();
      return;
    }
    // Proceed with checkout for authenticated users
    router.push(`/${params.lang}/payment`);
    toast.success('Proceeding to payment');
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Checkout</h1>
      
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
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Delivery Information</h5>
                  {token && user ? (
                    <div>
                      <p>Logged in as: {user.Email}</p>
                      <p>Contact Name: {user.FirstName} {user.LastName}</p>
                      {/* Delivery form would go here */}
                    </div>
                  ) : (
                    <div className="alert alert-warning">
                      Please login to continue with checkout
                    </div>
                  )}
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Order Items</h5>
                  <ul className="list-group">
                    {cartItems.map(item => (
                      <li key={item.ID} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <h6>{item.name}</h6>
                          <small>Qty: {item.quantity}</small>
                        </div>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Order Summary</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal ({cartItemCount} items)</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  
                  <Button 
                    variant="primary" 
                    className="w-100 mt-3"
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0}
                  >
                    {token ? 'Place Order' : 'Login to Checkout'}
                  </Button>
                  
                  <Link 
                    href={`/${params.lang}/cart`} 
                    className="btn btn-outline-secondary w-100 mt-2"
                  >
                    Back to Cart
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

export default CheckoutPage;