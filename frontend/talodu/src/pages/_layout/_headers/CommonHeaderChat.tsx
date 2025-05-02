import React, { useEffect, useState } from 'react';
import OffCanvas, { OffCanvasBody, OffCanvasHeader } from '../../../components/bootstrap/OffCanvas';
import Chat, { ChatGroup, ChatHeader } from '../../../components/Chat';
import InputGroup from '../../../components/bootstrap/forms/InputGroup';
import Textarea from '../../../components/bootstrap/forms/Textarea';
import Button from '../../../components/bootstrap/Button';
import USERS from '../../../common/data/userDummyData';
import Avatar from '../../../components/Avatar';
import showNotification from '../../../components/extras/showNotification';
import CHATS from '../../../common/data/chatDummyData';
import { useAuth } from '../../presentation/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const CommonHeaderChat = () => {
	const [state, setState] = useState<boolean>(false);
	const [msgCount, setMsgCount] = useState<number>(0);
	const {user, logout, loading, loaddata} = useAuth();
	const [forceUpdate, setForceUpdate] = useState(0);

	//const { user, loading } = useAuth();
  const navigate = useNavigate();
  const storedToken = localStorage.getItem('j_auth_token');
	const storedUser = JSON.stringify(localStorage.getItem('j_user'));
	//const storedUser = localStorage.getItem('j_user');

  useEffect(() => {
    if (!loading && !user) {
      // Redirect if not logged in

	  console.log("The user is", user);
	  console.log("The loading is", loading);
	  console.log("Getting user...");
            const storedToken = localStorage.getItem('j_auth_token');
            const storedUser = localStorage.getItem('j_user');
     // navigate('auth-pages/login');
    }
  }, [user, loading, navigate]);

useEffect(() => {
	
  if (user?.username) {
    setForceUpdate(prev => prev + 1);
  }
}, [user]);

useEffect(() => {
	console.log("User changed:", user);
  }, [user]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			loaddata();
			setMsgCount(1);
/** 
			showNotification(
				<span className='d-flex align-items-center'>
					<Avatar
						srcSet={USERS.CHLOE.srcSet}
						src={USERS.CHLOE.src}
						size={36}
						color={USERS.CHLOE.color}
						className='me-3'
					/>
					<span> {user?.username} sent a message.</span>
				</span>,
				<div onClick={() => setState(!state)} role='presentation'>
					<p>I think it's really starting to shine.</p>
				</div>,
			);
			*/
		}, 10);
		return () => {
			clearTimeout(timeout);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setMsgCount(0);
	}, [state]);

	return (
		<>
			<div
				className='col d-flex align-items-center cursor-pointer'
				onClick={() => setState(!state)}
				role='presentation'>
				<div className='me-3'>
					<div className='text-end'>
						<div className='fw-bold fs-6 mb-0'>
							{user?.FirstName} {user?.LastName}
						</div>
						<div className='text-muted'>
							<small>
								{user?.Roles.map((r)=>r.Name+", ")}
							</small>
						</div>
						<div className='text-muted' onClick={logout}>
							<small>Logout
								
							</small>
						</div>

					</div>
				</div>
				<div className='position-relative'>
					<Avatar
						srcSet={USERS.CHLOE.srcSet}
						src={USERS.CHLOE.src}
						size={48}
						color={USERS.CHLOE.color}
					/>
					{!!msgCount && (
						<span className='position-absolute top-15 start-85 translate-middle badge rounded-pill bg-danger'>
							{msgCount} <span className='visually-hidden'>unread messages</span>
						</span>
					)}
					<span className='position-absolute top-85 start-85 translate-middle badge border border-2 border-light rounded-circle bg-success p-2'>
						<span className='visually-hidden'>Online user</span>
					</span>
				</div>
			</div>
			<OffCanvas
				id='chat'
				isOpen={state}
				setOpen={setState}
				placement='end'
				isModalStyle
				isBackdrop={false}
				isBodyScroll>
				<OffCanvasHeader setOpen={setState} className='fs-5'>
					<ChatHeader to={USERS.CHLOE.name} />
				</OffCanvasHeader>
				<OffCanvasBody>
					<Chat>
						{CHATS.CHLOE_VS_JOHN.map((msg) => (
							<ChatGroup
								key={msg.id}
								messages={msg.messages}
								user={msg.user}
								isReply={msg.isReply}
							/>
						))}
					</Chat>
				</OffCanvasBody>
				<div className='chat-send-message p-3'>
					<InputGroup>
						<Textarea />
						<Button color='info' icon='Send'>
							SEND
						</Button>
					</InputGroup>
				</div>
			</OffCanvas>
		</>
	);
};

export default CommonHeaderChat;
