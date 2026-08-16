import './i18n';
import './theme.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/layout/App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { HelmetProvider } from 'react-helmet-async';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/api/queryClient';

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);

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
	</React.StrictMode>
);
