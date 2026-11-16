export const PROJECT_FILES: Record<string, string> = {
	'package.json': '{\n  "name": "vscode-portfolio",\n  "version": "1.0.0"\n}',
	'README.md': '# VsCode Portfolio\n\nInteractive portfolio by Gabriel Feijó.',
	'contact.txt':
		'Email: feijo6622@gmail.com\nGitHub: github.com/GabrielFeijo\nLinkedIn: linkedin.com/in/gabriel-feijo\nWebsite: gabrielfeijo.com.br\nLocation: Recife, Brazil',
	'src/index.tsx':
		'import React from "react";\nimport { createRoot } from "react-dom/client";\n\ncreateRoot(document.getElementById("root")!).render(<App />);',
	'src/app/layout/app.tsx': 'export default function App() {}',
	'src/app/pages/home.tsx': 'export default function Home() {}',
	'src/app/components/terminal/cmd.tsx': 'export default function Cmd() {}',
	'src/services/api/command/command-service.ts': 'export const CommandService = {};',
	'src/pages/pt/sobre-mim.html': '<h1>Sobre Mim</h1>',
	'src/styles/about.css': '.header { display: flex; }',
	'src/locales/pt/translation.json': '{}',
	'src/locales/en/translation.json': '{}',
	'public/robots.txt': 'User-agent: *',
};
