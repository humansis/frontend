<template>
	<section class="section">
		<div class="columns">
			<div class="column is-half is-offset-one-quarter">
				<section class="modal-card-body">
					<p class="is-size-4 my-5">{{ $t('User Information') }}</p>
					<b-field :label="$t('Email')">
						<b-input v-model="user.email" disabled />
					</b-field>
					<form @submit.prevent="submitPasswordForm">
						<p class="is-size-4 my-5">{{ $t('Change Password') }}</p>
						<section>
							<b-field :label="$t('Old Password')">
								<b-input type="password" />
							</b-field>

							<b-field :label="$t('New Password')">
								<b-input v-model="passwordForm.newPassword" type="password" />
							</b-field>

							<b-field :label="$t('Re-Enter New Password')">
								<b-input v-model="passwordForm.reenteredPassword" type="password" />
							</b-field>

							<div class="level-right mt-5">
								<b-button type="is-primary" slot="trigger">
									{{ $t('Save') }}
								</b-button>
							</div>
						</section>
					</form>
					<form @submit.prevent="submitTelephoneForm">
						<p class="is-size-4 my-5">{{ $t('Change Phone Number') }}</p>
						<b-field grouped>
							<b-field :label="$t('Phone Ext')">
								<MultiSelect
									v-model="telephoneForm.prefix"
									searchable
									label="value"
									track-by="code"
									:options="options.phonePrefixes"
									:placeholder="$t('Click to select')"
								/>
							</b-field>
							<b-field :label="$t('Phone Number')" expanded>
								<b-input v-model="telephoneForm.telephoneNumber" />
							</b-field>
						</b-field>
						<div class="level-right mt-5">
							<b-button type="is-primary">
								{{ $t('Save') }}
							</b-button>
						</div>
					</form>
					<section>
						<p class="is-size-4 my-5">{{ $t('Two Factor Authentication') }}</p>
						<div class="has-text-centered">
							{{ $t(`Two-factor authentication adds an additional layer of security
							to your account by requiring more than a password to log in`) }}
						</div>
						<br>
						<div class="has-text-centered">
							<strong>
								{{ $t('Two Factor Authentication') }}
								{{ twoFactorEnabled ? $t('Enabled') : $t('Disabled') }}
							</strong>
						</div>
						<div class="level-right mt-5">
							<b-button type="is-primary" @click="enableTwoFactor">
								{{ twoFactorEnabled ? $t('Disable') : $t('Enable') }}
							</b-button>
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

		// TODO After login and user profile update will be implemented by BE
		submitPasswordForm() {
			console.log("Password Submitted");
		},

		// TODO After login and user profile update will be implemented by BE
		submitTelephoneForm() {
			console.log("Telephone Submitted");
		},

		// TODO After login and user profile update will be implemented by BE
		enableTwoFactor() {
			console.log("Two Factor");
		},

	},
};
</script>
