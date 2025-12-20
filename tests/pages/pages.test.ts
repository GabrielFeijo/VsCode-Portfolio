import { pageRoutes } from '../../src/app/pages/pages';

describe('pages.ts', () => {
    describe('pageRoutes', () => {
        it('should have en and pt properties', () => {
            expect(pageRoutes).toHaveProperty('en');
            expect(pageRoutes).toHaveProperty('pt');
        });

        describe('en routes', () => {
            it('should have 6 items', () => {
                expect(pageRoutes.en).toHaveLength(6);
            });

            it('should have correct structure for each item', () => {
                pageRoutes.en.forEach((item, index) => {
                    expect(item).toHaveProperty('index', index);
                    expect(item).toHaveProperty('name');
                    expect(item).toHaveProperty('route');
                    expect(typeof item.name).toBe('string');
                    expect(typeof item.route).toBe('string');
                });
            });

            it('should have correct about-me route', () => {
                const aboutMe = pageRoutes.en.find(item => item.index === 0);
                expect(aboutMe?.name).toBe('about-me.html');
                expect(aboutMe?.route).toBe('about-me');
            });

            it('should have correct skills route', () => {
                const skills = pageRoutes.en.find(item => item.index === 1);
                expect(skills?.name).toBe('skills.html');
                expect(skills?.route).toBe('skills');
            });

            it('should have correct projects route', () => {
                const projects = pageRoutes.en.find(item => item.index === 2);
                expect(projects?.name).toBe('projects.html');
                expect(projects?.route).toBe('projects');
            });

            it('should have correct experience route', () => {
                const experience = pageRoutes.en.find(item => item.index === 3);
                expect(experience?.name).toBe('experience.html');
                expect(experience?.route).toBe('experience');
            });

            it('should have correct accomplishments route', () => {
                const accomplishments = pageRoutes.en.find(item => item.index === 4);
                expect(accomplishments?.name).toBe('accomplishments.html');
                expect(accomplishments?.route).toBe('accomplishments');
            });

            it('should have correct certificates route', () => {
                const certificates = pageRoutes.en.find(item => item.index === 5);
                expect(certificates?.name).toBe('certificates.html');
                expect(certificates?.route).toBe('certificates');
            });
        });

        describe('pt routes', () => {
            it('should have 6 items', () => {
                expect(pageRoutes.pt).toHaveLength(6);
            });

            it('should have correct structure for each item', () => {
                pageRoutes.pt.forEach((item, index) => {
                    expect(item).toHaveProperty('index', index);
                    expect(item).toHaveProperty('name');
                    expect(item).toHaveProperty('route');
                    expect(typeof item.name).toBe('string');
                    expect(typeof item.route).toBe('string');
                });
            });

            it('should have correct sobre-mim route', () => {
                const sobreMim = pageRoutes.pt.find(item => item.index === 0);
                expect(sobreMim?.name).toBe('sobre-mim.html');
                expect(sobreMim?.route).toBe('about-me');
            });

            it('should have correct habilidades route', () => {
                const habilidades = pageRoutes.pt.find(item => item.index === 1);
                expect(habilidades?.name).toBe('habilidades.html');
                expect(habilidades?.route).toBe('skills');
            });

            it('should have correct projetos route', () => {
                const projetos = pageRoutes.pt.find(item => item.index === 2);
                expect(projetos?.name).toBe('projetos.html');
                expect(projetos?.route).toBe('projects');
            });

            it('should have correct experiencia route', () => {
                const experiencia = pageRoutes.pt.find(item => item.index === 3);
                expect(experiencia?.name).toBe('experiencia.html');
                expect(experiencia?.route).toBe('experience');
            });

            it('should have correct conquistas route', () => {
                const conquistas = pageRoutes.pt.find(item => item.index === 4);
                expect(conquistas?.name).toBe('conquistas.html');
                expect(conquistas?.route).toBe('accomplishments');
            });

            it('should have correct certificados route', () => {
                const certificados = pageRoutes.pt.find(item => item.index === 5);
                expect(certificados?.name).toBe('certificados.html');
                expect(certificados?.route).toBe('certificates');
            });
        });
    });
});