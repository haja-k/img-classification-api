<template>
  <v-app>
    <ICPNavigation />
    <ICPFooter />
  </v-app>
</template>

<script>
import ICPNavigation from '@/components/navigation';
import ICPFooter from '@/components/footer';

export default {
  name: 'ImageClassification',
  components: {
    ICPNavigation,
    ICPFooter
  }
};
</script>
