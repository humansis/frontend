<template>
	<section class="section">
		<div class="columns">
			<div class="column is-half is-offset-one-quarter">
				<section class="modal-card-body">
					<p class="is-size-4 my-5">User Information</p>
					<b-field label="Email">
						<b-input v-model="user.email" disabled />
					</b-field>
					<form @submit.prevent="submitPasswordForm">
						<p class="is-size-4 my-5">Change Password</p>
						<section>
							<b-field label="Old Password">
								<b-input
									type="password"
								/>
							</b-field>

							<b-field label="New Password">
								<b-input
									v-model="passwordForm.newPassword"
									type="password"
								/>

							</b-field>

							<b-field label="Re-Enter New Password">
								<b-input
									v-model="passwordForm.reenteredPassword"
									type="password"
								/>
							</b-field>

							<div class="level-right mt-5">
								<b-button type="is-primary" slot="trigger">
									Save
								</b-button>
							</div>
						</section>
					</form>
					<form @submit.prevent="submitTelephoneForm">
						<p class="is-size-4 my-5">Change Phone Number</p>
						<b-field grouped>
							<b-field
								label="Phone Ext"
							>
								<MultiSelect
									v-model="telephoneForm.prefix"
									searchable
									placeholder="Phone Ext"
									label="value"
									track-by="code"
									:options="options.phonePrefixes"
								/>
							</b-field>
							<b-field label="Phone Number" expanded>
								<b-input
									v-model="telephoneForm.telephoneNumber"
								/>
							</b-field>
						</b-field>
						<div class="level-right mt-5">
							<b-button type="is-primary">
								Save
							</b-button>
						</div>
					</form>
					<section>
						<p class="is-size-4 my-5">2 Factor Authentication</p>
						<div class="has-text-centered">
							Two-factor authentication adds an additional layer of security to
							your account by requiring more than a password to log in
						</div>
						<br>
						<div class="has-text-centered">
							<strong>
								Two Factor Authentication {{ twoFactorEnabled ? "Enabled" : "Disabled" }}
							</strong>
						</div>
						<div class="level-right mt-5">
							<button class="button is-primary" @click="enableTwoFactor">
								{{ twoFactorEnabled ? "Disable" : "Enable" }}
							</button>
						</div>
					</section>
				</section>
			</div>
		</div>
	</section>
</template>

<script>
import PhoneCodes from "@/utils/phoneCodes";

export default {
	name: "Profile",

	data() {
		return {
			user: {
				email: "admin@example.org",
			},
			passwordForm: {
				oldPassword: "",
				newPassword: "",
				reenteredPassword: "",
			},
			telephoneForm: {
				prefix: "",
				telephoneNumber: "",
			},
			twoFactorEnabled: false,
			options: {
				phonePrefixes: PhoneCodes,
			},
		};
	},

	methods: {

		// TODO
		submitPasswordForm() {
			console.log("Password Submitted");
		},

		// TODO
		submitTelephoneForm() {
			console.log("Telephone Submitted");
		},

		// TODO
		enableTwoFactor() {
			console.log("Two Factor");
		},

	},
};
</script>
