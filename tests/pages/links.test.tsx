import { contact, contato } from '../../src/app/pages/links';

describe('links.tsx', () => {
    describe('contact array', () => {
        it('should have 3 items', () => {
            expect(contact).toHaveLength(3);
        });

        it('should have correct structure for each item', () => {
            contact.forEach((item, index) => {
                expect(item).toHaveProperty('index', index);
                expect(item).toHaveProperty('title');
                expect(item).toHaveProperty('href');
                expect(item).toHaveProperty('icon');
                expect(typeof item.title).toBe('string');
                expect(typeof item.href).toBe('string');
                expect(item.icon).toBeDefined();
            });
        });

        it('should have correct GitHub link', () => {
            const github = contact.find(item => item.index === 0);
            expect(github?.title).toBe('Find me on Github');
            expect(github?.href).toBe('https://github.com/GabrielFeijo');
        });

        it('should have correct LinkedIn link', () => {
            const linkedin = contact.find(item => item.index === 1);
            expect(linkedin?.title).toBe('Find me on LinkedIn');
            expect(linkedin?.href).toBe('https://www.linkedin.com/in/gabriel-feijo/');
        });

        it('should have correct email link', () => {
            const email = contact.find(item => item.index === 2);
            expect(email?.title).toBe('Contact me via email');
            expect(email?.href).toBe('mailto:feijo6622@gmail.com');
        });
    });

    describe('contato array', () => {
        it('should have 3 items', () => {
            expect(contato).toHaveLength(3);
        });

        it('should have correct structure for each item', () => {
            contato.forEach((item, index) => {
                expect(item).toHaveProperty('index', index);
                expect(item).toHaveProperty('title');
                expect(item).toHaveProperty('href');
                expect(item).toHaveProperty('icon');
                expect(typeof item.title).toBe('string');
                expect(typeof item.href).toBe('string');
                expect(item.icon).toBeDefined();
            });
        });

        it('should have correct GitHub link in Portuguese', () => {
            const github = contato.find(item => item.index === 0);
            expect(github?.title).toBe('Encontre-me no Github');
            expect(github?.href).toBe('https://github.com/GabrielFeijo');
        });

        it('should have correct LinkedIn link in Portuguese', () => {
            const linkedin = contato.find(item => item.index === 1);
            expect(linkedin?.title).toBe('Encontre-me no LinkedIn');
            expect(linkedin?.href).toBe('https://www.linkedin.com/in/gabriel-feijo/');
        });

        it('should have correct email link in Portuguese', () => {
            const email = contato.find(item => item.index === 2);
            expect(email?.title).toBe('Contate-me por e-mail');
            expect(email?.href).toBe('mailto:feijo6622@gmail.com');
        });
    });
});