export default {
	methods: {
		graduallyIncrement(propertyName, newValue, max, time) {
			if (newValue > this[propertyName]) {
				// Increment gradually to animate
				const interval = setInterval(() => {
					if (newValue <= this[propertyName]) {
						clearInterval(interval);
					} else if (this[propertyName] < max) {
						this[propertyName] += 1;
					}
				}, time);
			}
		},
	},
};
