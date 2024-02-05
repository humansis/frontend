import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import actions from "@/store/actions";
import mutations from "@/store/mutations";
import state from "@/store/state";

const store = createStore({
	// FIXME remove this
	plugins: [createPersistedState({
		storage: window.localStorage,
	})],
	state,
	mutations,
	actions,
});

export default store;
