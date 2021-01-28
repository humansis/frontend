import { mapState } from "vuex";
import permissions from "@/permissions";

export default {
	data() {
		return { ...permissions };
	},
	computed: {
		...mapState(["auth"]),
	},
	created() {
		// TODO: For each stored permission set this dot property permissions
	},
};
