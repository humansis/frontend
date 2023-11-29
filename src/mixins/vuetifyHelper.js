import { useDisplay } from "vuetify";

export default {
	computed: {
		isMobile() {
			const { mobile } = useDisplay();
			return mobile.value;
		},
	},
};
