import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, fa } from "vuetify/iconsets/fa-svg";
import "vuetify/styles";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

library.add(fas); // Include needed solid icons

const humansisTheme = {
	dark: false,
	colors: {
		primary: "#074f60",
	},
};

const vuetify = createVuetify({
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
