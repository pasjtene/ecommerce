import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from './Button';

// eslint-disable-next-line no-undef
test('Render Light Info Button', () => {
	render(
		<Button color='info' isLight>
			Click
		</Button>,
	);
	const buttonElement = screen.getByText(/click/i);
	// eslint-disable-next-line no-undef
	expect(buttonElement).toHaveClass('btn-light-info');
	// eslint-disable-next-line no-undef
	expect(buttonElement).toBeInTheDocument();
});
