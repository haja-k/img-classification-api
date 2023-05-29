<template>
   <br>
   <br>
   <v-sheet :elevation="24" rounded class="pa-6 text-white mx-auto" max-width="400">
      <v-card>
         <v-toolbar dark color="secondary">
            <v-toolbar-title>{{ isRegister ? stateObj.register.name : stateObj.login.name }}
               form</v-toolbar-title>
         </v-toolbar>
         <v-card-text>
            <form ref="form" @submit.prevent="isRegister ? register() : login()">
               <v-text-field v-model="username" name="username" label="Username" type="text" placeholder="username"
                  required></v-text-field>

               <v-text-field v-model="password" name="password" label="Password" type="password" placeholder="password"
                  required></v-text-field>

               <v-text-field v-if="isRegister" v-model="confirmPassword" name="confirmPassword" label="Confirm Password"
                  type="password" placeholder="confirm password" required></v-text-field>

               <div class="red--text">{{ errorMessage }}</div>

               <v-btn type="submit" class="mt-4" color="secondary">{{ isRegister ? stateObj.register.name :
                  stateObj.login.name }}</v-btn>

               <div class="grey--text mt-4" v-on:click="isRegister = !isRegister;">{{ toggleMessage }}</div>
            </form>
         </v-card-text>
      </v-card>
   </v-sheet>
</template>
 
  
<script>
export default {
   name: "App",
   data() {
      return {
         username: "",
         password: "",
         confirmPassword: "",
         isRegister: false,
         errorMessage: "",
         stateObj: {
            register: {
               name: 'Register',
               message: 'Already have an Account? Login.'
            },
            login: {
               name: 'Login',
               message: 'Register'
            }
         },
         snackbar: false,
         snackbarText: ""
      };
   },
   methods: {
      login() {
         const { username } = this;
         console.log(username + " logged in");
      },
      register() {
         if (this.password === this.confirmPassword) {
            this.isRegister = false;
            this.errorMessage = "";
            this.$refs.form.reset();
         } else {
            this.errorMessage = "Password did not match";
         }
      }
   },
   computed: {
      toggleMessage() {
         return this.isRegister ? this.stateObj.register.message : this.stateObj.login.message;
      }
   }
};
</script>
 