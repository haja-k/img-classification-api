<template>
    <v-container>
      <v-row>
        <v-col cols="12" class="text-center">
          <h1 class="display-1 my-5">Pricing</h1>
          <h2 class="display-1 font-weight-black">Plans that scale with your user growth</h2>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4" v-for="(plan, index) in plans" :key="index">
          <v-card>
            <v-img :src="plan.image" height="300px">
              <v-card-subtitle class="subheading purple white--text py-2">
                {{ plan.subtitle }}
              </v-card-subtitle>
              <v-card-actions>
                <v-btn small>Try it</v-btn>
              </v-card-actions>
            </v-img>
            <v-card-title>
              <div>
                <h3 class="headline">{{ plan.title }}</h3>
                <ul>
                  <li v-for="(feature, i) in plan.features" :key="i">{{ feature }}</li>
                </ul>
              </div>
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  export default {
    name: 'RocketPlans',
    data() {
      return {
        plans: [
          {
            title: 'Developer',
            subtitle: 'DEVELOPER',
            features: ['Includes 1,000 sessions / mo', '14 day data retention'],
            image: require('../assets/rocket_1.jpg')
          },
          {
            title: 'Team',
            subtitle: 'TEAM',
            features: ['Starting at 10,000 sessions / mo', 'Starting at 1 month retention'],
            image: require('../assets/rocket_2.jpg')
          },
          {
            title: 'Professional',
            subtitle: 'PROFESSIONAL',
            features: ['Any volume of Sessions', 'Custom data retention', 'On-premise available'],
            image: require('../assets/rocket_1.jpg')
          }
        ]
      };
    }
  };
  </script>
  