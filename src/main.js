import { createApp } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import App from "@/App";
import router from "@/router";
import store from "@/store";
import i18n from "@/plugins/i18n";
import vuetify from "@/plugins/vuetify";
import "@/assets/scss/main.scss";

const app = createApp(App);

app.config.productionTip = false;

app.component("font-awesome-icon", FontAwesomeIcon); // Register component globally

app.use(router);
app.use(store);
app.use(i18n);
app.use(vuetify);

app.mount("#app");
