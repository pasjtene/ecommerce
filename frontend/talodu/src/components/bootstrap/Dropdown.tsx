import React, {
	cloneElement,
	ElementType,
	FC,
	forwardRef,
	HTMLAttributes,
	JSXElementConstructor,
	ReactElement,
	ReactNode,
	useCallback,
	useRef,
	useState,
} from 'react';
import { Manager, Popper, Reference } from 'react-popper';
import classNames from 'classnames';
// @ts-ignore
import useEventOutside from '@omtanke/react-use-event-outside';
import useDarkMode from '../../hooks/useDarkMode';

import { IButtonProps } from './Button';
import { TDropdownDirection } from '../../type/dropdown-type';

interface IDropdownToggleProps {
	children: ReactElement<IButtonProps> | ReactNode;
	isOpen?: boolean;
	setIsOpen?: (value: ((prevState: boolean) => boolean) | boolean | null) => void | null;
	hasIcon?: boolean;
}
export const DropdownToggle: FC<IDropdownToggleProps> = ({
	children,
	isOpen,
	setIsOpen = () => {},
	hasIcon = true,
}) => {
	const dropdownButtonRef = useRef(null);

	const setButtonRef = useCallback((node: null, ref: (arg0: any) => any) => {
		dropdownButtonRef.current = node;
		return ref(node);
	}, []);
	return (
		<Reference>
			{({ ref }) =>
				cloneElement(
					// @ts-ignore
					children.props.isButtonGroup ? (
						<span className='visually-hidden'>Toggle Dropdown</span>
					) : (
						children
					),
					{
						// @ts-ignore
						ref: (node: null) => setButtonRef(node, ref),
						onClick: () => {
							// @ts-ignore
							// eslint-disable-next-line @typescript-eslint/no-unused-expressions
							children?.props?.onClick ? children.props.onClick() : null;
							if (setIsOpen) {
								setIsOpen(!isOpen);
							}
						},
						className: classNames(
							{
								'dropdown-toggle': hasIcon,
								// @ts-ignore
								'dropdown-toggle-split': children.props.isButtonGroup,
								// Only presentation
								show: isOpen,
							},
							// @ts-ignore
							children?.props?.className,
						),
						'aria-expanded': isOpen,
					},
				)
			}
		</Reference>
	);
};
DropdownToggle.displayName = 'DropdownToggle';

interface IDropdownMenuProps extends HTMLAttributes<HTMLUListElement> {
	isOpen?: boolean;
	setIsOpen?: (value: ((prevState: boolean) => boolean) | boolean | null) => void | null;
	children:
		| ReactElement<IDropdownItemProps>
		| ReactElement<IDropdownItemProps>[]
		| ReactNode
		| ReactNode[];
	className?: string;
	isAlignmentEnd?: boolean;
	breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null;
	size?: 'sm' | 'md' | 'lg' | null;
	direction?: string | null;
	isCloseAfterLeave?: boolean;
}
export const DropdownMenu: FC<IDropdownMenuProps> = ({
	isOpen,
	setIsOpen = () => {},
	children,
	className,
	isAlignmentEnd,
	breakpoint,
	size,
	direction,
	isCloseAfterLeave = true,
	...props
}) => {
	const dropdownListRef = useRef(null);

	const setListRef = useCallback((node: null, ref: (arg0: any) => any) => {
		dropdownListRef.current = node;
		return ref(node);
	}, []);

	const yAxis =
		(direction === 'up' && 'top') ||
		(direction === 'end' && 'right') ||
		(direction === 'start' && 'left') ||
		'bottom';

	const xAxis = isAlignmentEnd ? 'end' : 'start';

	const { darkModeStatus } = useDarkMode();

	if (isOpen) {
		return (
			<Popper
				placement={breakpoint ? 'bottom-start' : `${yAxis}-${xAxis}`}
				modifiers={[
					{
						name: 'flip',
						options: {
							fallbackPlacements: [`top-${xAxis}`, `bottom-${xAxis}`],
						},
					},
				]}>
				{({ ref, style, placement }) => (
					<ul
						role='presentation'
						// @ts-ignore
						ref={(node) => setListRef(node, ref)}
						// dynamic positioning must be disabled for responsive alignment
						style={!breakpoint ? style : undefined}
						data-placement={placement}
						className={classNames(
							'dropdown-menu',
							// For Bootstrap
							'show',
							{ 'dropdown-menu-dark': darkModeStatus },
							{
								[`dropdown-menu-${size}`]: size,
								'dropdown-menu-end': !isAlignmentEnd && breakpoint,
								[`dropdown-menu${breakpoint ? `-${breakpoint}` : ''}-${
									isAlignmentEnd ? 'end' : 'start'
								}`]: isAlignmentEnd || breakpoint,
							},
							className,
						)}
						data-bs-popper={breakpoint ? 'static' : null}
						onMouseLeave={
							isCloseAfterLeave && setIsOpen ? () => setIsOpen(false) : undefined
						}
						{...props}>
						{children}
					</ul>
				)}
			</Popper>
		);
	}
	return null;
};
DropdownMenu.displayName = 'DropdownMenu';

interface IItemWrapperProps {
	children: ReactNode;
	className?: string;
}
const ItemWrapper = forwardRef<HTMLLIElement, IItemWrapperProps>(
	({ children, className, ...props }, ref) => {
		return (
			<li ref={ref} className={classNames('dropdown-item-wrapper', className)} {...props}>
				{children}
			</li>
		);
	},
);
ItemWrapper.displayName = 'ItemWrapper';

interface IDropdownItemProps extends HTMLAttributes<HTMLLIElement> {
	children?: ReactElement<any, string | JSXElementConstructor<any>> | string;
	isHeader?: boolean;
	isDivider?: boolean;
	isText?: boolean;
}
export const DropdownItem = forwardRef<HTMLLIElement, IDropdownItemProps>(
	({ children, isHeader, isDivider, isText, ...props }, ref) => {
		if (isHeader) {
			return (
				// eslint-disable-next-line react/jsx-props-no-spreading
				<ItemWrapper ref={ref} {...props}>
					{cloneElement(
						// @ts-ignore
						typeof children === 'string' ? <h6>{children}</h6> : children,
						{
							// @ts-ignore

							className: classNames('dropdown-header', children?.props?.className),
						},
					)}
				</ItemWrapper>
			);
		}
		if (isDivider) {
			return (
				// eslint-disable-next-line react/jsx-props-no-spreading
				<ItemWrapper ref={ref} {...props}>
					{} {/* @ts-ignore */}
					<hr className={classNames('dropdown-divider', children?.props?.className)} />
				</ItemWrapper>
			);
		}
		if (isText) {
			return (
				// eslint-disable-next-line react/jsx-props-no-spreading
				<ItemWrapper ref={ref} {...props}>
					{cloneElement(
						// @ts-ignore
						typeof children === 'string' ? <div>{children}</div> : children,
						{
							className: classNames(
								'dropdown-item-text',
								'dropdown-item',
								'disabled',
								// @ts-ignore

								children?.props?.className,
							),
						},
					)}
				</ItemWrapper>
			);
		}
		return (
			// eslint-disable-next-line react/jsx-props-no-spreading
			<ItemWrapper ref={ref} {...props}>
				{cloneElement(
					// @ts-ignore
					typeof children === 'string' ? <span>{children}</span> : children,
					{
						// @ts-ignore

						className: classNames('dropdown-item', children?.props?.className),
					},
				)}
			</ItemWrapper>
		);
	},
);
DropdownItem.displayName = 'DropdownItem';

export interface IDropdownProps {
	tag?: ElementType;
	children: ReactElement<IDropdownToggleProps>[] | ReactElement<IDropdownMenuProps>[];
	isOpen?: boolean | null;
	setIsOpen?(...args: unknown[]): unknown;
	direction?: TDropdownDirection;
	isButtonGroup?: boolean;
	className?: string;
}
const Dropdown: FC<IDropdownProps> = ({
	tag: Tag = 'div',
	children,
	isOpen,
	setIsOpen,
	direction = 'down',
	isButtonGroup,
	className,
}) => {
	const [state, setState] = useState(isOpen !== null && !!setIsOpen ? isOpen : false);

	const dropdownRef = useRef(null);

	// Clicking outside to close
	const closeMenu = useCallback(() => {
		if (isOpen !== null && !!setIsOpen) {
			setIsOpen(false);
		} else {
			setState(false);
		}
	}, [isOpen, setIsOpen]);

	useEventOutside(dropdownRef, 'mousedown', closeMenu);
	useEventOutside(dropdownRef, 'touchstart', closeMenu);

	return (
		<Manager>
			{/* @ts-ignore */}
			<Tag
				ref={dropdownRef}
				className={classNames(
					{
						[`drop${direction}`]: direction && !isButtonGroup,
						'btn-group': isButtonGroup,
					},
					className,
				)}>
				{}
				{/* @ts-ignore */}
				{children.map((child: ReactElement, index: any) =>
					// @ts-ignore
					['DropdownMenu', 'DropdownToggle'].includes(child.type.displayName)
						? cloneElement(child, {
								// @ts-ignore
								isOpen: isOpen !== null && !!setIsOpen ? isOpen : state,
								setIsOpen: isOpen !== null && !!setIsOpen ? setIsOpen : setState,
								direction,

								key: index,
							})
						: child,
				)}
			</Tag>
		</Manager>
	);
};
Dropdown.displayName = 'Dropdown';

export default Dropdown;
