import Vue from "vue";
import App from "@/App.vue";
import router from "@/router";
import store from "@/store";

import "@/plugins/buefy";
import "@/plugins/vuelidate";
import "@/plugins/breadcrumbs";
import "@/plugins/vueselect";
import "@/plugins/vueswatches";
import "@/plugins/vuecountryflag";
import "@/plugins/moment";

Vue.config.productionTip = false;

new Vue({
	router,
	store,
	render: (h) => h(App),
}).$mount("#app");
