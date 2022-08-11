export default {
	methods: {
		graduallyIncrement(propertyName, newValue, time) {
			if (newValue > this[propertyName]) {
				// Increment gradually to animate
				const interval = setInterval(() => {
					if (newValue <= this[propertyName]) {
						clearInterval(interval);
					}
					this[propertyName] += 1;
				}, time);
			}
		},
	},
};
