import React, { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/img/logo2.png"
            alt="Logo"
            style={{ width: 'auto', height: '100%', objectFit: 'contain' }}
        />
    );
}
