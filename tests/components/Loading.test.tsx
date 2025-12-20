import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from '../../src/app/components/Loading/Loading';

describe('Loading', () => {
    it('renders loading screen with logo', () => {
        render(<Loading />);
        const img = screen.getByAltText('Logo vscode');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'test-file-stub');
        expect(img).toHaveStyle({ height: '20%' });
        expect(img).toHaveClass('logo');
    });

    it('renders with correct container styles', () => {
        const { container } = render(<Loading />);
        const box = container.firstChild;
        expect(box).toHaveStyle({
            width: '100vw',
            height: '100vh',
            position: 'absolute',
            top: '0',
            left: '0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            backgroundColor: '#282a36',
            zIndex: '99'
        });
    });
});