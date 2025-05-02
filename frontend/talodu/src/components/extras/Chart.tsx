import React, { FC, HTMLAttributes, memo } from 'react';
import ReactApexChart from 'react-apexcharts';
import classNames from 'classnames';
import { ApexOptions } from 'apexcharts';

interface IChartProps extends HTMLAttributes<HTMLDivElement> {
	series: ApexOptions['series'];
	options: ApexOptions;
	type?: ApexChart['type'];
	width?: string | number;
	height?: string | number;
	className?: string;
}
const Chart: FC<IChartProps> = ({
	series,
	options,
	type = 'line',
	width = '100%',
	height = 'auto',
	className,
	...props
}) => {
	return (
		<div className={classNames('apex-chart', className)} {...props}>
			<ReactApexChart
				options={{
					colors: [
						process.env.REACT_APP_PRIMARY_COLOR,
						process.env.REACT_APP_SECONDARY_COLOR,
						process.env.REACT_APP_SUCCESS_COLOR,
						process.env.REACT_APP_INFO_COLOR,
						process.env.REACT_APP_WARNING_COLOR,
						process.env.REACT_APP_DANGER_COLOR,
					],
					plotOptions: {
						candlestick: {
							colors: {
								upward: process.env.REACT_APP_SUCCESS_COLOR,
								downward: process.env.REACT_APP_DANGER_COLOR,
							},
						},
						boxPlot: {
							colors: {
								upper: process.env.REACT_APP_SUCCESS_COLOR,
								lower: process.env.REACT_APP_DANGER_COLOR,
							},
						},
					},
					...options,
				}}
				series={series}
				// @ts-ignore
				type={type}
				width={width}
				height={height}
			/>
		</div>
	);
};

/**
 * For use useState
 */
export interface IChartOptions extends Record<string, any> {
	series: ApexOptions['series'];
	options: ApexOptions;
}

export default memo(Chart);
