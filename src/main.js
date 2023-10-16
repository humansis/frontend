import Vue from "vue";
import "@/plugins/buefy";
import "@/plugins/vuelidate";
import "@/plugins/breadcrumbs";
import "@/plugins/vueselect";
import "@/plugins/vueswatches";
import "@/plugins/vuecountryflag";
import "@/plugins/vuemoment";
import "@/plugins/vueloading";
import "@/plugins/vuehtmlsecure";
import App from "@/App.vue";
import i18n from "@/plugins/i18n";
import router from "@/router";
import store from "@/store";

Vue.config.productionTip = false;

new Vue({
	router,
	store,
	i18n,
	mounted() {
		document.documentElement.classList.remove("has-spinner-active");
	},
	render: (h) => h(App),
}).$mount("#app");
