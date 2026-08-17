let counter = 0;

function customAlphabet(_alphabet, _size) {
	return () => {
		counter += 1000;
		return String(counter);
	};
}

module.exports = {
	nanoid: () => `nanoid-${++counter}`,
	customAlphabet,
};
