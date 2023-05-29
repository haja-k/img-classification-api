<template>
  <v-app>
    <core-site-navigation />
    <core-site-footer />
  </v-app>
</template>

<script>
import CoreSiteNavigation from '@/components/core/ConstantNavigation.vue'
import CoreSiteFooter from '@/components/core/SiteFooter.vue'

export default {
  name: 'App',
  components: {
    CoreSiteNavigation,
    CoreSiteFooter
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c503a;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
