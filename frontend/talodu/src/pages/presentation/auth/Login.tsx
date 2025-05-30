import React, { FC, useCallback, useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useFormik } from 'formik';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Logo from '../../../components/Logo';
import useDarkMode from '../../../hooks/useDarkMode';
import AuthContext from '../../../contexts/authContext';
import USERS, { getUserDataWithUsername } from '../../../common/data/userDummyData';
import Spinner from '../../../components/bootstrap/Spinner';
import Alert from '../../../components/bootstrap/Alert';
import {useAuth, AuthProvider } from './AuthContextNext'
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface ILoginHeaderProps {
	isNewUser?: boolean;
}




const LoginHeader: FC<ILoginHeaderProps> = ({ isNewUser }) => {
	if (isNewUser) {
		return (
			<>
				<div className='text-center h1 fw-bold mt-5'>Create Account,</div>
				<div className='text-center h4 text-muted mb-5'>Sign up to get started!</div>
			</>
		);
	}
	return (
		<>
			<div className='text-center h1 fw-bold mt-5'>Welcome,</div>
			<div className='text-center h4 text-muted mb-5'>Sign in to continue!</div>
		</>
	);
};

interface ILoginProps {
	isSignUp?: boolean;
}
const Login: FC<ILoginProps> = ({ isSignUp }) => {
	const { setUser } = useContext(AuthContext);
	const { user, hasRole, login, loaddata } = useAuth();
	const [showPassword, setShowPassword] = useState(false); 

	const { darkModeStatus } = useDarkMode();

	const [signInPassword, setSignInPassword] = useState<boolean>(false);
	const [singUpStatus, setSingUpStatus] = useState<boolean>(!!isSignUp);

	const navigate = useNavigate();
	const handleOnClick = useCallback(() => navigate('/'), [navigate]);
	const handleOnClick2 = useCallback(() => navigate('/'), [navigate]);

	const usernameCheck = (username: string) => {
		return !!getUserDataWithUsername(username);
	};

	const passwordCheck = (username: string, password: string) => {
		//return getUserDataWithUsername(username).password === password;
		return true;
	};

	const [forceUpdate, setForceUpdate] = useState(0);

useEffect(() => {
  if (user?.username) {
    setForceUpdate(prev => prev + 1);
  }
}, [user]);



	const formik = useFormik({
		
		enableReinitialize: true,
		initialValues: {
			loginUsername: "",
			loginPassword: "",
		},
		validate: (values) => {
			const errors: { loginUsername?: string; loginPassword?: string } = {};

			if (!values.loginUsername) {
				errors.loginUsername = 'Required';
			}

			if (!values.loginPassword) {
				errors.loginPassword = 'Required';
			}

			return errors;
		},
		validateOnChange: false,
		onSubmit: (values) => {


		try {
			//await 
			//const user = login(values.loginUsername, values.loginPassword);
			
			navigate('/'); // Redirect after successful login
			//loaddata();
		  } catch (err) {
			//setError('Invalid credentials');
			formik.setFieldError('loginPassword', 'Username and password do not match.');
		  }
		},
	});

	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleContinue = async () => {
		

    try {
		const user =  await login(formik.values.loginUsername, formik.values.loginPassword, "url");
	  setTimeout(() => {
		console.log("Ready to navigate...", user);
      navigate('/'); // Redirect after successful login
	}, 1000);

    } catch (err) {
     // setError('Invalid credentials');
	  formik.setFieldError('loginUsername', 'Username and password do not match.!!');
	  formik.setFieldError('loginPassword', 'Username and password do not match.!!');
    }

  };



	return (
		
		<PageWrapper
			isProtected={false}
			title={singUpStatus ? 'Sign Up' : 'Login'}
		//	className={classNames({ 'bg-dark': !singUpStatus, 'bg-light': singUpStatus })}>
			className={classNames('bg-light')}>
			<Page className='p-0'>
				<div className='row h-100 align-items-center justify-content-center'>
					<div className='col-xl-4 col-lg-6 col-md-8 mt-3 shadow-3d-container border border-success'>
						<Card className='shadow-3d-dark rounded-0 border border-success' data-tour='login-page'>
							<CardBody>
								<div className='text-center my-5 border border-success'>
									<Link
										to='/'
										className={classNames(
											'text-decoration-none  fw-bold display-2',
											{
												'text-dark': !darkModeStatus,
												'text-light': darkModeStatus,
											},
										)}
										aria-label='Facit'>
										<Logo width={200} />
									</Link>
								</div>
								<div
									className={classNames('rounded-3', {
										'bg-l10-dark': !darkModeStatus,
										'bg-dark': darkModeStatus,
									})}>
									<div className='row row-cols-2 g-3 pb-3 px-3 mt-0'>
										<div className='col'>
											<Button
												color={darkModeStatus ? 'light' : 'dark'}
												isLight={singUpStatus}
												className='rounded-1 w-100'
												size='lg'
												onClick={() => {
													setSignInPassword(false);
													setSingUpStatus(!singUpStatus);
												}}>
												Login
											</Button>
										</div>
										<div className='col'>
											<Button
												color={darkModeStatus ? 'light' : 'dark'}
												isLight={!singUpStatus}
												className='rounded-1 w-100'
												size='lg'
												onClick={() => {
													setSignInPassword(false);
													setSingUpStatus(!singUpStatus);
												}}>
												Sign Up 1J
											</Button>
										</div>
									</div>
								</div>

								<LoginHeader isNewUser={singUpStatus} />

								<Alert isLight icon='Lock' isDismissible>
									<div className='row'>
										<div className='col-12'>
											<strong>Username:</strong> {user?.username}
										</div>
										<div className='col-12'>
											<strong>Password:</strong>
										</div>
									</div>
								</Alert>
								<form className='row g-4'>
									{singUpStatus ? (
										<>
											<div className='col-12'>
												<FormGroup
													id='signup-email'
													isFloating
													label='Your email'>
													<Input type='email' autoComplete='email' />
												</FormGroup>
											</div>
											<div className='col-12'>
												<FormGroup
													id='signup-name'
													isFloating
													label='Your name'>
													<Input autoComplete='given-name' />
												</FormGroup>
											</div>
											<div className='col-12'>
												<FormGroup
													id='signup-surname'
													isFloating
													label='Your surname'>
													<Input autoComplete='family-name' />
												</FormGroup>
											</div>
											<div className='col-12'>
												<FormGroup
													id='signup-password'
													isFloating
													label='Password'>
													<Input
														type='password'
														autoComplete='password'
													/>
												</FormGroup>
											</div>
											<div className='col-12'>
												<Button
													color='info'
													className='w-100 py-3'
													onClick={handleOnClick}>
													Sign Up
												</Button>
											</div>
										</>
									) : (
										<>
											<div className='col-12'>
												<FormGroup
													id='loginUsername'
													isFloating
													label='Your email or username'
													className={classNames({
														'd-none': signInPassword,
													})}>
													<Input
														autoComplete='username'
														value={formik.values.loginUsername}
														isTouched={formik.touched.loginUsername}
														invalidFeedback={
															formik.errors.loginUsername
														}
														isValid={formik.isValid}
														onChange={formik.handleChange}
														onBlur={formik.handleBlur}
														onFocus={() => {
															formik.setErrors({});
														}}
													/>
												</FormGroup>
												{signInPassword && (
													<div className='text-center h4 mb-3 fw-bold'>
														Hi, {formik.values.loginUsername}.
													</div>
												)}
												<div className='mt-3'>

												<div style={{ position: 'relative' }}>
												<FormGroup
													id='loginPassword'
													isFloating
													label='Your Password'
													className={classNames({
														'd-none1': !signInPassword,
														
													})}>
														
													<Input
														//type='password' 
														type={showPassword ? 'text' : 'password'}
												
														autoComplete='current-password'
														value={formik.values.loginPassword}
														isTouched={formik.touched.loginPassword}
														invalidFeedback={
															formik.errors.loginPassword
														}
														validFeedback='Looks good!'
														isValid={formik.isValid}
														onChange={formik.handleChange}
														onBlur={formik.handleBlur}
														
													/>

													{/** 
													<button
														type="button"
														onClick={() => setShowPassword(!showPassword)}
														style={{
														position: 'absolute',
														right: '10px',
														top: '50%',
														transform: 'translateY(-50%)',
														background: 'none',
														border: 'none',
														cursor: 'pointer',
														color: '#6c757d', // Gray color (adjust as needed)
														}}
													>
														{showPassword ? <FaEyeSlash /> : <FaEye />}
													</button>
													*/}
													 
												</FormGroup>
												</div>
												
												<div 
													onClick={() => setShowPassword(!showPassword)}
													style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
													>
													{showPassword ? (
														<>
														<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
															<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
															<line x1="1" y1="1" x2="23" y2="23"></line>
														</svg>
														Hide password
														</>
													) : (
														<>
														<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
															<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
															<circle cx="12" cy="12" r="3"></circle>
														</svg>
														Show password
														</>
													)}
													</div>
												</div>
												
											</div>
											<div className='col-12'>
												{!signInPassword ? (
													<Button
														color='warning'
														className='w-100 py-3'
														isDisable={!formik.values.loginUsername}
														onClick={handleContinue}>
														{isLoading && (
															<Spinner isSmall inButton isGrow />
														)}
														Continue Hi, { user?.FirstName } { user?.LastName }
													</Button>
												) : (
													<Button
														color='warning'
														className='w-100 py-3'
														onClick={formik.handleSubmit}>
														Login
													</Button>
												)}
											</div>
										</>
									)}

									{/* BEGIN :: Social Login */}
									{!signInPassword && (
										<>
											<div className='col-12 mt-3 text-center text-muted'>
												OR
											</div>
											<div className='col-12 mt-3'>
												<Button
													isOutline
													color={darkModeStatus ? 'light' : 'dark'}
													className={classNames('w-100 py-3', {
														'border-light': !darkModeStatus,
														'border-dark': darkModeStatus,
													})}
													icon='CustomApple'
													onClick={handleOnClick}>
													Sign in with Apple
												</Button>
											</div>
											<div className='col-12'>
												
											</div>
										</>
									)}
									{/* END :: Social Login */}
								</form>
							</CardBody>
						</Card>
						<div className='text-center'>
							<a
								href='/'
								className={classNames('text-decoration-none me-3', {
									'link-light': singUpStatus,
									'link-dark': !singUpStatus,
								})}>
								Privacy policy
							</a>
							<a
								href='/'
								className={classNames('link-light text-decoration-none', {
									'link-light': singUpStatus,
									'link-dark': !singUpStatus,
								})}>
								Terms of use
							</a>
						</div>
					</div>
				</div>
			</Page>
		</PageWrapper>
		
	);
};

export default Login;
