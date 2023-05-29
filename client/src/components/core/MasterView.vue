<template>
    <v-content>
        <div id="core-master-view">
            <v-fade-transition mode="out-in">
                <router-view />
            </v-fade-transition>
        </div>
    </v-content>
</template>
  
<script>
import { defineComponent } from 'vue'

export default defineComponent({})
</script>
  
<style></style>
  