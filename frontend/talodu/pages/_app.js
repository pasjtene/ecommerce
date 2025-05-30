import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { useEffect } from 'react';
import { AuthProvider} from '../src/pages/presentation/auth/AuthContextNext';
import { ToastContainer } from 'react-toastify'; // <-- ADD THIS LINE
import 'react-toastify/dist/ReactToastify.css';

export default function MyApp({ Component, pageProps }) {
    useEffect(() => {
        // Dynamically import Bootstrap JS (and Popper.js if needed)
        // This ensures it only runs in the browser.
        import('bootstrap/dist/js/bootstrap.bundle.min.js'); // Includes Popper.js
      }, []);

  //return <Component {...pageProps} />;

  return (
    <AuthProvider> 
      <Component {...pageProps} />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </AuthProvider>
  );
}

//export default MyApp;

{/**
    MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object,
};
    */}
