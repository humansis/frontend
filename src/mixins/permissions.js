import { mapState } from "vuex";

export default {
	computed: {
		...mapState({ userCan: "permissions" }),
	},

	mounted() {
		console.log("userCan", this.userCan);
	},
};
