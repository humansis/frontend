import Vue from "vue";
import App from "@/App.vue";
import router from "@/router";
import store from "@/store";
import i18n from "@/plugins/i18n";

import "@/plugins/buefy";
import "@/plugins/vuelidate";
import "@/plugins/breadcrumbs";
import "@/plugins/vueselect";
import "@/plugins/vueswatches";
import "@/plugins/vuecountryflag";

Vue.config.productionTip = false;

new Vue({
	router,
	store,
	i18n,
	render: (h) => h(App),
}).$mount("#app");
