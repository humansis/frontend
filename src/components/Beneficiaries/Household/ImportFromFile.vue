<template>
	<div>
		<div class="tile is-ancestor">
			<div class="tile is-parent">
				<article class="tile is-child notification">
					<div class="content">
						<div class="content">
							<b-field>
								<b-upload
									v-model="dropFile"
									drag-drop
									expanded
								>
									<section class="section">
										<div class="content has-text-centered">
											<p>
												<b-icon
													icon="upload"
													size="is-large"
													custom-size="fa-3x"
												/>
											</p>
											<p>{{ uploadText }}</p>
										</div>
									</section>
								</b-upload>
							</b-field>
						</div>
					</div>
				</article>
			</div>
			<div class="tile is-parent">
				<article class="tile is-child notification">
					<div class="content">
						<div class="content has-text-centered">
							<b-icon
								class="m-5"
								icon="clipboard-list"
								size="is-large"
								custom-size="fa-4x"
							/>
							<MultiSelect
								v-model="selectedProject"
								class="m-5"
								track-by="id"
								label="name"
								:options="projects"
							/>
						</div>
					</div>
				</article>
			</div>
		</div>
		<div class="is-pulled-left">
			<b-button
				icon-left="todo"
				class="m-2"
				@click="convertFile"
			>
				Convert File
			</b-button>
			<b-button
				class="mt-2"
				@click="downloadTemplate"
			>
				Download Template
			</b-button>
			<b-dropdown
				v-model="currentFormat"
				aria-role="list"
				class="mt-2"
			>
				<b-button slot="trigger">
					<template>
						<span>{{currentFormat.name}}</span>
					</template>
					<b-icon icon="arrow-down" />
				</b-button>
				<b-dropdown-item
					v-for="(menu, index) in formatMenu"
					:key="index"
					:value="menu"
				>
					<div class="media">
						<div class="media-content">
							<h3>{{menu.name}}</h3>
						</div>
					</div>
				</b-dropdown-item>
			</b-dropdown>
		</div>
		<div class="is-pulled-right">
			<b-button
				class="is-success"
				icon-left="import"
				@click="importFile"
			>
				Import
			</b-button>
		</div>
	</div>

</template>

<script>
import ProjectsService from "@/services/ProjectsService";
import { Toast } from "@/utils/UI";

export default {
	name: "ImportFromFile",

	data() {
		return {
			dropFile: null,
			currentFormat: { name: ".xlsx" },
			formatMenu: [
				{ name: ".xlsx" },
				{ name: ".csv" },
				{ name: ".odt" },
			],
			selectedProject: null,
			projects: [],
		};
	},

	computed: {
		uploadText() {
			return !this.dropFile ? "Drop your files here or click to upload" : this.dropFile.name;
		},
	},

	mounted() {
		this.fetchProjects();
	},

	methods: {
		async fetchProjects() {
			await ProjectsService.getListOfProjects(
				1,
				15,
				"desc",
			).then((response) => {
				this.projects = response.data;
			});
		},

		downloadTemplate() {
			console.log(this.currentFormat);
		},

		convertFile() {
			// TODO on this method open modal
			console.log("Convert File");
		},

		importFile() {
			if (!this.dropFile || !this.selectedProject) {
				Toast("You must insert file for import and select project before uploading", "is-danger");
			}
			// TODO route to next page and prepare file for show
		},
	},
};
</script>
