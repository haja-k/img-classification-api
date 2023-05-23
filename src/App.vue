<template>
  <v-app>
    <RocketNavigation />
    <RocketPlans />
    <RocketFooter />
  </v-app>
</template>

<script>
import RocketNavigation from '@/components/navigation';
import RocketPlans from '@/components/plans';
import RocketFooter from '@/components/footer';

export default {
  name: 'LogRocketApp',
  components: {
    RocketNavigation,
    RocketPlans,
    RocketFooter
  }
};
</script>
