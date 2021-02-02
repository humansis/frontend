import Vue from "vue";
import Buefy from "buefy";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas, faHeadphonesAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import "@/assets/scss/app.scss";

library.add(fas, faHeadphonesAlt);
Vue.component("vue-fontawesome", FontAwesomeIcon);

Vue.use(Buefy, {
	defaultIconComponent: "vue-fontawesome",
	defaultIconPack: "fas",
});
