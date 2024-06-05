import { computed } from "vue";
import { useDisplay } from "vuetify";

const vuetifyHelper = () => {
	const { mobile } = useDisplay();
	const isMobile = computed(() => mobile.value);

	return { isMobile };
};

export default vuetifyHelper;
