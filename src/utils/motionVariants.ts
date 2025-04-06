import { Variants } from 'framer-motion';

export const slideInOut: Variants = {
	initial: {
		opacity: 0,
		x: -20,
	},
	animate: {
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
	},
	exit: {
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
	},
};

export const slideUpDown: Variants = {
	initial: {
		opacity: 0,
		y: 300,
		height: 0,
	},
	animate: {
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
	},
	exit: {
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
	},
};

export const fadeInOut: Variants = {
	initial: {
		opacity: 0,
	},
	animate: {
		opacity: 1,
		transition: {
			duration: 0.3,
			ease: 'easeInOut',
			layout: {
				duration: 0.3,
				ease: 'easeInOut',
			},
		},
	},
	exit: {
		transition: {
			duration: 0.2,
			ease: 'easeInOut',
			layout: {
				duration: 0.2,
				ease: 'easeInOut',
			},
		},
	},
};

export const sidebarAnimations: Variants = {
	initial: {
		opacity: 0,
		x: -50,
		width: 0,
	},
	animate: {
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
	},
	exit: {
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
	},
};

export const sidebarItemAnimations: Variants = {
	initial: {
		opacity: 0,
		x: -20,
	},
	animate: {
		opacity: 1,
		x: 0,
		transition: {
			duration: 0.1,
			type: 'spring',
			stiffness: 450,
			damping: 25,
		},
	},
	exit: {
		opacity: 0,
		x: -20,
		transition: {
			duration: 0.1,
			type: 'spring',
			stiffness: 500,
			damping: 35,
		},
	},
};

export const terminalAnimations: Variants = {
	initial: {
		opacity: 0,
		y: '100%',
	},
	animate: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3,
			ease: [0.4, 0, 0.2, 1],
		},
	},
	exit: {
		opacity: 0,
		y: '100%',
		transition: {
			duration: 0.2,
			ease: [0.4, 0, 0.2, 1],
		},
	},
};

export const layoutAnimations = {
	layout: {
		type: 'spring',
		stiffness: 350,
		damping: 30,
		mass: 1,
	},
};

export const fadeAnimations: Variants = {
	initial: {
		opacity: 0,
	},
	animate: {
		opacity: 1,
		transition: {
			duration: 0.2,
			ease: [0.25, 0.1, 0.25, 1.0],
		},
	},
	exit: {
		opacity: 0,
		transition: {
			duration: 0.15,
			ease: [0.25, 0.1, 0.25, 1.0],
		},
	},
};
