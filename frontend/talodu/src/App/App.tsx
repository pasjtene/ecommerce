import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ThemeProvider } from 'react-jss';
import { ReactNotifications } from 'react-notifications-component';
import { useFullscreen } from 'react-use';
import { TourProvider } from '@reactour/tour';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ToastContainer } from 'react-toastify';
import ThemeContext from '../contexts/themeContext';
import Wrapper from '../layout/Wrapper/Wrapper';
import Portal from '../layout/Portal/Portal';
import useDarkMode from '../hooks/useDarkMode';
import COLORS from '../common/data/enumColors';
import { getOS } from '../helpers/helpers';
import steps, { styles } from '../steps';
import AsideRoutes from '../layout/Aside/AsideRoutes';
import { ToastCloseButton } from '../components/bootstrap/Toasts';
import { useAuth, AuthProvider } from '../pages/presentation/auth/AuthContextNext';
import { Helmet, HelmetProvider } from 'react-helmet-async';
//import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const App = () => {
	getOS();

	dayjs.extend(localizedFormat);
	dayjs.extend(relativeTime);

	/**
	 * Dark Mode
	 */
	const { themeStatus, darkModeStatus } = useDarkMode();
	const theme = {
		theme: themeStatus,
		primary: COLORS.PRIMARY.code,
		secondary: COLORS.SECONDARY.code,
		success: COLORS.SUCCESS.code,
		info: COLORS.INFO.code,
		warning: COLORS.WARNING.code,
		danger: COLORS.DANGER.code,
		dark: COLORS.DARK.code,
		light: COLORS.LIGHT.code,
	};

	//const { user, hasRole, login } = useAuth();

	useEffect(() => {
		if (darkModeStatus) {
			document.documentElement.setAttribute('theme', 'dark');
			document.documentElement.setAttribute('data-bs-theme', 'dark');
		}
		return () => {
			document.documentElement.removeAttribute('theme');
			document.documentElement.removeAttribute('data-bs-theme');
		};
	}, [darkModeStatus]);

	/**
	 * Full Screen
	 */
	const { fullScreenStatus, setFullScreenStatus } = useContext(ThemeContext);
	const ref = useRef(null);
	// @ts-ignore
	useFullscreen(ref, fullScreenStatus, {
		onClose: () => setFullScreenStatus(false),
	});

	/**
	 * Modern Design
	 */
	useLayoutEffect(() => {
		if (process.env.REACT_APP_MODERN_DESGIN === 'true') {
			document.body.classList.add('modern-design');
		} else {
			document.body.classList.remove('modern-design');
		}
	});

	

	return (
		
		<HelmetProvider>
		<AuthProvider>
		<ThemeProvider theme={theme}>
			<TourProvider steps={steps} styles={styles} showNavigation={false} showBadge={false}>
				<div
					ref={ref}
					className='app'
					style={{
						backgroundColor: fullScreenStatus ? 'var(--bs-body-bg)' : undefined,
						zIndex: fullScreenStatus ? 1 : undefined,
						overflow: fullScreenStatus ? 'scroll' : undefined,
					}}>
						
					<AsideRoutes />
					<Wrapper />
				</div>
				<Portal id='portal-notification'>
					<ReactNotifications />
				</Portal>
				<ToastContainer closeButton={ToastCloseButton} toastClassName='toast show' />
			</TourProvider>
		</ThemeProvider>
		</AuthProvider>
		</HelmetProvider>
		
		
	);
};

export default App;
