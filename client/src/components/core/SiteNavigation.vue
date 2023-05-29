<template>
  <v-main>
    <v-container class="site-navigate">
      <v-app-bar app dark>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-spacer class="hidden-md-and-up"></v-spacer>
        <v-img src="../../assets/photo_up.png" max-width="120px" max-height="25px"></v-img>
        <v-btn flat class="hidden-sm-and-down">Image Classification Platform</v-btn>
        <v-spacer class="hidden-sm-and-down"></v-spacer>
        <v-btn prepend-icon="mdi-login" class="hidden-sm-and-down">
          <template v-slot:prepend>
            <v-icon color="brown darken-2"></v-icon>
          </template>
          Log In
        </v-btn>
      </v-app-bar>
      <v-navigation-drawer app v-model="drawer">
        <v-list>
          <template v-for="(menu, i) in menus" :key="i">
            <v-list-item>
              <v-list-item-content>
                {{ menu.value }}
              </v-list-item-content>
            </v-list-item>
            <v-divider v-if="i < menus.length - 1" :key="`divider-${i}`"></v-divider>
          </template>
        </v-list>
      </v-navigation-drawer>
    </v-container>
  </v-main>
</template>
  
<script>
export default {
  name: 'ICPNavigation',
  data() {
    return {
      drawer: false,
      menus: [
        { value: 'Data Input' },
        { value: 'Data Preparation' },
        { value: 'Model Selection' },
        { value: 'Evaluation' },
        { value: 'Exportation' },
      ]
    };
  }
};
</script>
  
