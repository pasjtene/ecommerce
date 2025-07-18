"use client"
import React, { forwardRef, ReactElement, useContext, useEffect, useLayoutEffect } from 'react';
import classNames from 'classnames';
//import { useNavigate } from 'react-router-dom';
import { ISubHeaderProps } from '../SubHeader/SubHeader';
import { IPageProps } from '../Page/Page';
//import AuthContext from '../../contexts/authContext';
import { demoPagesMenu } from '../../menu';

interface IPageWrapperProps {
	isProtected?: boolean;
	title?: string;
	description?: string;
	children:
		| ReactElement<ISubHeaderProps>[]
		| ReactElement<IPageProps>
		| ReactElement<IPageProps>[];
	className?: string;
}
const PageWrapper = forwardRef<HTMLDivElement, IPageWrapperProps>(
	({ isProtected = true, title, description, className, children }, ref) => {
		useLayoutEffect(() => {
			// @ts-ignore
			if (typeof document !== 'undefined') {
				if (document.getElementsByTagName('TITLE')[0]) {
			document.getElementsByTagName('TITLE')[0].innerHTML = `${title ? `${title} | ` : ''}${
				process.env.REACT_APP_SITE_NAME
			}`;
		}
		}
			console.log("In page wripper, the description is: ",description);
			console.log("In page wripper, the title is: ",title);
			// @ts-ignore
			//document?.querySelector('meta[name="description"]')
				
				//?.setAttribute('content', description || process.env.REACT_APP_META_DESC || '');
		});

		//const { user } = useContext(AuthContext);

		//const navigate = useNavigate();
		useEffect(() => {
			//console.log("in useEffect route..user is:..",user)
			//if (isProtected && user === '') {
				if (isProtected ) {
				//console.log("Protected route..user is:..",user)
				//navigate(`../${demoPagesMenu.login.path}`);
				
			}
			return () => {};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		return (
			<div ref={ref} className={classNames('page-wrapper', 'container-fluid', className)}>
				{children}
			</div>
		);
	},
);
PageWrapper.displayName = 'PageWrapper';

export default PageWrapper;
