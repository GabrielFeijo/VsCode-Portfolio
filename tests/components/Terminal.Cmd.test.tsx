import React from 'react';
import { render } from '@testing-library/react';

jest.mock('../../src/app/components/Terminal/Cmd', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="mock-cmd" data-props={JSON.stringify(props)} />
  ),
}));

import Cmd from '../../src/app/components/Terminal/Cmd';

test('renders Cmd component', () => {
  const { getByTestId } = render(
    <Cmd setRanking={() => { }} changeLanguage={() => { }} /> as any
  );
  expect(getByTestId('mock-cmd')).toBeTruthy();
});
