import React from 'react';
import classNames from 'classnames';
import useDarkMode from '../../../hooks/useDarkMode';
import Footer from '../../../layout/Footer/Footer';

const DefaultFooter = () => {
	const { darkModeStatus } = useDarkMode();

	return (
		<div className='row mt-5'>
			<Footer>
			<div className='container-fluid'>
				<div className='row'>
					<div className='col'>
						<span className='fw-light'>Copyright © 2025 - Version 4.4.2</span>
					</div>
					<div className='col-auto'>
						<a
							href='/'
							className={classNames('text-decoration-none', {
								'link-dark': !darkModeStatus,
								'link-light': darkModeStatus,
							})}>
							<small className='fw-bold me-5'>Talodu Theme</small>
						</a>
					</div>
				</div>
			</div>
		</Footer>
		</div>
		
	);
};

export default DefaultFooter;
