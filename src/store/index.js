import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

import state from "@/store/state";
import actions from "@/store/actions";
import mutations from "@/store/mutations";

Vue.use(Vuex);

export default new Vuex.Store({
	plugins: [createPersistedState({
		storage: window.sessionStorage,
	})],
	state,
	mutations,
	actions,
});
