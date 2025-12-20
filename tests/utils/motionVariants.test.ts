import { slideInOut, slideUpDown, fadeInOut, sidebarAnimations, sidebarItemAnimations, terminalAnimations, layoutAnimations, fadeAnimations } from '../../src/utils/motionVariants';

describe('motionVariants', () => {
    describe('slideInOut', () => {
        test('has initial state', () => {
            expect(slideInOut.initial).toEqual({
                opacity: 0,
                x: -20,
            });
        });

        test('has animate state', () => {
            expect(slideInOut.animate).toEqual({
                opacity: 1,
                x: 0,
                transition: {
                    duration: 0.3,
                    ease: 'easeInOut',
                    layout: {
                        duration: 0.3,
                        ease: 'easeInOut',
                    },
                },
            });
        });

        test('has exit state', () => {
            expect(slideInOut.exit).toEqual({
                opacity: 0,
                x: -20,
                transition: {
                    duration: 0.2,
                    ease: 'easeInOut',
                    layout: {
                        duration: 0.2,
                        ease: 'easeInOut',
                    },
                },
            });
        });
    });

    describe('slideUpDown', () => {
        test('has initial state', () => {
            expect(slideUpDown.initial).toEqual({
                opacity: 0,
                y: 300,
                height: 0,
            });
        });

        test('has animate state', () => {
            expect(slideUpDown.animate).toEqual({
                opacity: 1,
                y: 0,
                height: '300px',
                transition: {
                    duration: 0.3,
                    ease: 'easeInOut',
                    layout: {
                        duration: 0.3,
                        ease: 'easeInOut',
                    },
                },
            });
        });

        test('has exit state', () => {
            expect(slideUpDown.exit).toEqual({
                opacity: 0,
                y: 300,
                height: 0,
                transition: {
                    duration: 0.5,
                    ease: 'easeInOut',
                    layout: {
                        duration: 0.2,
                        ease: 'easeInOut',
                    },
                },
            });
        });
    });

    describe('fadeInOut', () => {
        test('has initial state', () => {
            expect(fadeInOut.initial).toEqual({
                opacity: 0,
            });
        });

        test('has animate state', () => {
            expect(fadeInOut.animate).toEqual({
                opacity: 1,
                transition: {
                    duration: 0.3,
                    ease: 'easeInOut',
                    layout: {
                        duration: 0.3,
                        ease: 'easeInOut',
                    },
                },
            });
        });

        test('has exit state', () => {
            expect(fadeInOut.exit).toEqual({
                transition: {
                    duration: 0.2,
                    ease: 'easeInOut',
                    layout: {
                        duration: 0.2,
                        ease: 'easeInOut',
                    },
                },
            });
        });
    });

    describe('sidebarAnimations', () => {
        test('has initial state', () => {
            expect(sidebarAnimations.initial).toEqual({
                opacity: 0,
                x: -50,
                width: 0,
            });
        });

        test('has animate state', () => {
            expect(sidebarAnimations.animate).toEqual({
                opacity: 1,
                x: 0,
                width: 'auto',
                transition: {
                    type: 'spring',
                    stiffness: 350,
                    damping: 25,
                    mass: 0.95,
                    staggerChildren: 0.05,
                },
            });
        });

        test('has exit state', () => {
            expect(sidebarAnimations.exit).toEqual({
                opacity: 0,
                x: -50,
                width: 0,
                transition: {
                    type: 'spring',
                    stiffness: 400,
                    damping: 35,
                    mass: 0.8,
                    staggerChildren: 0.03,
                    staggerDirection: -1,
                },
            });
        });
    });

    describe('sidebarItemAnimations', () => {
        test('has initial state', () => {
            expect(sidebarItemAnimations.initial).toEqual({
                opacity: 0,
                x: -20,
            });
        });

        test('has animate state', () => {
            expect(sidebarItemAnimations.animate).toEqual({
                opacity: 1,
                x: 0,
                transition: {
                    duration: 0.1,
                    type: 'spring',
                    stiffness: 450,
                    damping: 25,
                },
            });
        });

        test('has exit state', () => {
            expect(sidebarItemAnimations.exit).toEqual({
                opacity: 0,
                x: -20,
                transition: {
                    duration: 0.1,
                    type: 'spring',
                    stiffness: 500,
                    damping: 35,
                },
            });
        });
    });

    describe('terminalAnimations', () => {
        test('has initial state', () => {
            expect(terminalAnimations.initial).toEqual({
                opacity: 0,
                y: '100%',
            });
        });

        test('has animate state', () => {
            expect(terminalAnimations.animate).toEqual({
                opacity: 1,
                y: 0,
                transition: {
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                },
            });
        });

        test('has exit state', () => {
            expect(terminalAnimations.exit).toEqual({
                opacity: 0,
                y: '100%',
                transition: {
                    duration: 0.2,
                    ease: [0.4, 0, 0.2, 1],
                },
            });
        });
    });

    describe('layoutAnimations', () => {
        test('has layout configuration', () => {
            expect(layoutAnimations.layout).toEqual({
                type: 'spring',
                stiffness: 350,
                damping: 30,
                mass: 1,
            });
        });
    });

    describe('fadeAnimations', () => {
        test('has initial state', () => {
            expect(fadeAnimations.initial).toEqual({
                opacity: 0,
            });
        });

        test('has animate state', () => {
            expect(fadeAnimations.animate).toEqual({
                opacity: 1,
                transition: {
                    duration: 0.2,
                    ease: [0.25, 0.1, 0.25, 1.0],
                },
            });
        });

        test('has exit state', () => {
            expect(fadeAnimations.exit).toEqual({
                opacity: 0,
                transition: {
                    duration: 0.15,
                    ease: [0.25, 0.1, 0.25, 1.0],
                },
            });
        });
    });
});