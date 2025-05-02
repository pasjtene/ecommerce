import React, { FC } from 'react';

interface ILogoProps {
    width?: number;
    height?: number;
}
const Logo: FC<ILogoProps> = ({ width = 2155, height = 854 }) => {
    return (
        <div>
            
            
           GlobeGRC
           
        </div>
    );
};

export default Logo;
