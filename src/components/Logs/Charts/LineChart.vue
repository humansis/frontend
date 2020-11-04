<script>
import { Line } from "vue-chartjs";

export default {
	name: "LineChart",

	extends: Line,

	props: {
		datacollection: {},
		options: {},
	},

	mounted() {
		this.renderChart(this.datacollection, this.options);
	},

	watch: {
		datacollection() {
			this.renderChart(this.datacollection, this.options);
		},
	},

};
</script>
