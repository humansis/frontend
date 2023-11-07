import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import actions from "@/store/actions";
import mutations from "@/store/mutations";
import state from "@/store/state";

Vue.use(Vuex);

export default new Vuex.Store({
	plugins: [createPersistedState({
		storage: window.localStorage,
	})],
	state,
	mutations,
	actions,
});
