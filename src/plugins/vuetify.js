import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, fa } from "vuetify/iconsets/fa-svg";
import { library } from "@fortawesome/fontawesome-svg-core";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";

import "vuetify/styles/main.sass";

library.add(fas);
library.add(far);

const humansisTheme = {
	dark: false,
	colors: {
		primary: "#074f60",
	},
};

const vuetify = createVuetify({
	display: {
		mobileBreakpoint: "xs",
		thresholds: {
			xs: 660,
		},
	},
	icons: {
		defaultSet: "fa",
		aliases,
		sets: {
			fa,
		},
	},
	theme: {
		defaultTheme: "humansisTheme",
		themes: {
			humansisTheme,
		},
	},
	components,
	directives,
});

export default vuetify;
