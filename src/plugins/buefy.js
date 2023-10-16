import Vue from "vue";
import "@/assets/scss/main.scss";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import Buefy from "buefy";

library.add(fas);
Vue.component("vue-fontawesome", FontAwesomeIcon);

Vue.use(Buefy, {
	defaultIconComponent: "vue-fontawesome",
	defaultIconPack: "fas",
});
