// pages/index.tsx
"use client";
import React, {useState, useEffect } from 'react';
import Head from 'next/head'; // For meta tags and page title
import Footer from '../src/pages/presentation/footers/Footer'
//import HeaderNext from  '../src/pages/_layout/_headers/HeaderNext'
import AllProductDisplay from '../src/pages/presentation/sales/AllProductsDisplayNext'
//import HeaderNext from '../src/pages/_layout/_headers/HeaderNext';
import HeaderNext from './HeaderNext';


const HomePage = () => {
    // Define your French slogans
    const slogans = [
        "Talodu : Fraîcheur et qualité, livrées à votre porte.",
        "Votre supermarché en ligne, pour une vie plus simple.",
        "Découvrez les saveurs locales avec Talodu, à portée de clic.",
        "Talodu : Le marché frais qui vient à vous.",
        "Mangez mieux, vivez mieux, achetez Talodu.",
        "Talodu : Tout ce que vous cherchez, à portée de clic.",
        "Du quotidien à l'exceptionnel, Talodu a tout.",
        "Talodu : Votre univers d'achat, illimité.",
        "Des milliers de produits, une seule destination : Talodu.",
        "Simplifiez votre vie, magasinez chez Talodu.",
        "Talodu : L'embarras du choix, le plaisir en plus.",
        "Magasinez intelligent, magasinez Talodu.",
        "Talodu : Votre marché mondial, livré localement.",
        "La variété rencontre la valeur, chez Talodu.",
        "Talodu : Votre commande, votre confort."
      ];
  // Define transition duration (e.g., 1 second for fade in/out)
const TRANSITION_DURATION = 1000; // milliseconds
// Time each slogan is fully visible (total time - transition time)
const DISPLAY_DURATION = 5000; // milliseconds (10 seconds total)
const [opacity, setOpacity] = useState(1); // 1 for visible, 0 for hidden

  const [currentSloganIndex, setCurrentSloganIndex] = useState(0);
  useEffect(() => {
    // Phase 1: Show the slogan
    setOpacity(1); // Ensure it's fully visible at the start of its 10s display

    // Phase 2: Start fading out before the 10 seconds are up
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0);
    }, DISPLAY_DURATION - TRANSITION_DURATION); // Start fading out 1 second before the 10s is up

    // Phase 3: Change to the next slogan after the full 10 seconds (when it's fully faded out)
    const nextSloganTimer = setTimeout(() => {
      setCurrentSloganIndex((prevIndex) => (prevIndex + 1) % slogans.length);
    }, DISPLAY_DURATION); // Switch to next slogan after total display duration

    // Cleanup timers
    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(nextSloganTimer);
    };
  }, [currentSloganIndex]); // Re-run effect whenever the slogan index changes


  return (
    <div>
      <Head>
        <title>Talodu - Votre supermarché en Ligne</title>
        <meta name="description" content="Your online supermarket for fresh produce and more." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <HeaderNext /> {/* the header component */}

      <main style={{ minHeight: '20vh', padding: '20px' }}>
        <h1>Bienvenue chez Talodu!</h1>
        <p>Découvrez nos produits frais et locaux.</p>
            {/* Dynamic Slogan Display with Transition */}
        <div
          style={{
            margin: '20px 0',
            fontSize: '1.5em',
            fontWeight: 'bold',
            color: '#007bff',
            opacity: opacity, // Apply the controlled opacity
            transition: `opacity ${TRANSITION_DURATION / 1000}s ease-in-out`, // CSS transition for smooth fade
          }}
        >
          <h2>{slogans[currentSloganIndex]}</h2>
        </div>
        {/* End Dynamic Slogan Display */}
        {/* Add more content specific to your homepage here */}
      </main>

      <AllProductDisplay />

      <Footer /> {/* The footer component */}
    </div>
  );
};

export default HomePage;