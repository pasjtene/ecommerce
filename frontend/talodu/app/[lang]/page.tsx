
"use client";
import React, {useState, useEffect } from 'react';
import Head from 'next/head'; // For meta tags and page title
import Footer from '../../src/pages/presentation/footers/Footer'
import AllProductDisplay from './AllProductsDisplay'
import { Translation } from './types'
import { useParams } from 'next/navigation';
//import ClientLayoutWrapper from './ClientLayoutWrapper';

const HomePage = () => {
  const params = useParams();
const [t, setTranslation] = useState<Translation | null>(null);
// Load translation
    useEffect(() => {
      const loadTranslation = async () => {
        const t = await import(`./translations/${params.lang}.json`);
        setTranslation(t.default);
      };
      loadTranslation ();
    }, [params.lang]);

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



  // Slogan rotation effect
  useEffect(() => {
    if (!t) return;

    setOpacity(1);
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0);
    }, DISPLAY_DURATION - TRANSITION_DURATION);

    const nextSloganTimer = setTimeout(() => {
      setCurrentSloganIndex((prevIndex) => 
        (prevIndex + 1) % t.home.slogans.length
      );
    }, DISPLAY_DURATION);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(nextSloganTimer);
    };
  }, [currentSloganIndex, t]);


  return (
    
    <div className='container border border-secondary py-4'>
      <Head>
        <title>Talodu - Votre supermarché en Ligne</title>
        <meta name="description" content="Your online supermarket for fresh produce and more." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* the header component */}

      <div className='container border border-primary py-4' >
        <h1>{t?.home.title}</h1>
        <p>{t?.home.subtitle}</p>
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
          
          <h2>{t?.home.slogans[currentSloganIndex]}</h2>
        </div>
        {/* End Dynamic Slogan Display */}
        {/* Add more content specific to your homepage here */}
      </div>

      <AllProductDisplay />

      <Footer /> {/* The footer component */}
    </div>
    
  );
};

export default HomePage;

