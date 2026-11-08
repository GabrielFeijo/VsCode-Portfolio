import './i18n';
import './theme.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { SpeedInsights } from '@vercel/speed-insights/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import App from './app/layout/App';
import { ThemeProvider } from './contexts/ThemeContext';
import { queryClient } from './services/api/queryClient';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<HelmetProvider>
				<ThemeProvider>
					<BrowserRouter>
						<SpeedInsights />
						<App />
					</BrowserRouter>
				</ThemeProvider>
			</HelmetProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);
