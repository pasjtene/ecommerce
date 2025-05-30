import React, { FC, useCallback, useContext, useState, useEffect } from 'react';



const Footer = () => {
   



    return (
        
       <>
         <div className="card h-100 mt-4 "
             style={{ 
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(13, 89, 219, 0.2)',
                transition: 'box-shadow 0.3s ease',
                padding:  '7px', // Space between image and shadow
              }}
              //onMouseEnter={() => setHoveredCard(image.ID)}
              //onMouseLeave={() => setHoveredCard(null)}
              //onClick={() => handleImageClick(image.productSlug, image.productId)}
              //onClick={() => handleImageClick(image.product)}
            
            >

              <div className='mt-4 mb-4 row ms-md-2 p-1 g-1'>
                    <div className='col-12 ms-2 ms-md-2 col-md-3 text-center ps-md-2'>
                        Copyright © 2025 - iShopPro - Version 4.4.2
                    </div>
                    <div className='col-12 col-md-4 text-start text-md-end pe-md-2'>
                        Talodu - Your online super market
                    </div>
                    <div className='col-12 col-md-4 text-start text-md-end pe-md-1'>
                        Talodu - Votre supermarché en Ligne
                    </div>
                </div>
            
            </div>
       </>
        
    );
};

export default Footer;