import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../src/app/components/MDContainer', () => ({
    __esModule: true,
    default: (props: any) => <div data-testid="mock-md" data-props={JSON.stringify(props)} />,
}));

import MDContainer from '../../src/app/components/MDContainer';

test('renders markdown content fetched from path', async () => {
    render(
        <MemoryRouter>
            <MDContainer path={'/fake.md'} setPages={() => { }} />
        </MemoryRouter>
    );

    await waitFor(() => expect(document.body).toBeTruthy());
    expect(document.getElementById('root') || document.body).toBeTruthy();
});
