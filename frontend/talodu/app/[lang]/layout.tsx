// app/[lang]/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
//import '../../src/pages/presentation/sales/ProductImageGallery.css';
import './css/ProductImageGallery.css';
import './css/global.css';
import ClientComponentWrapper from './ClientComponentWrapper';


interface LayoutProps {                       
  children: React.ReactNode;
  params: {
    lang: string;
  };
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const resolvedParams = await Promise.resolve(params);

  return (
    <html lang={resolvedParams.lang}>
       <head>
        <meta property="og:locale" content={resolvedParams.lang} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:site" content="@talodu" />
      </head>
      <body>
        {/* This wrapper will contain all client components */}
        <ClientComponentWrapper>
          {children}
         
        </ClientComponentWrapper>
      </body>
    </html>
  );
}







