import { createApp } from "vue";
import App from "@/App";
import i18n from "@/plugins/i18n";
import htmlSecureDirective from "@/plugins/vuehtmlsecure";
import vuetify from "@/plugins/vuetify";
import router from "@/router";
import store from "@/store";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import moment from "moment";

import "@/assets/scss/main.scss";

const app = createApp(App);

app.directive("html-secure", htmlSecureDirective);

app.config.productionTip = false;

app.component("font-awesome-icon", FontAwesomeIcon);
app.config.globalProperties.$moment = moment;

app.use(router);
app.use(store);
app.use(i18n);
app.use(vuetify);

app.mount("#app");
