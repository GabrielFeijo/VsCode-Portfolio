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
            width: '100%',
            height: 'var(--app-viewport-height)',
            position: 'absolute',
            top: '0',
            left: '0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-primary)',
            zIndex: '99'
        });
    });
});
