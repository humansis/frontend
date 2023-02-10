export default {
	methods: {
		graduallyIncrement(propertyName, newValue, max, time) {
			if (newValue > this[propertyName]) {
				// Increment gradually to animate
				const interval = setInterval(() => {
					if (newValue <= this[propertyName]) {
						clearInterval(interval);
					}

					if (this[propertyName] < max && newValue > this[propertyName]) {
						this[propertyName] += 1;
					}
				}, time);
			}
		},
	},
};
