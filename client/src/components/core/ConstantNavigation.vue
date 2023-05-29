<template>
    <v-app id="inspire">
        <v-app-bar flat>
            <v-container class="fill-height d-flex align-center">
                <v-spacer class="hidden-md-and-up"></v-spacer>
                <v-img src="../../assets/photo_up.png" max-width="120px" max-height="25px"></v-img>
                <v-btn v-for="link in links" :key="link" variant="text">
                    {{ link }}
                </v-btn>

                <v-spacer></v-spacer>
                <v-spacer class="hidden-sm-and-down"></v-spacer>
                <v-btn prepend-icon="mdi-login" class="hidden-sm-and-down">
                    <template v-slot:prepend>
                        <v-icon color="brown darken-2"></v-icon>
                    </template>
                    Log In
                </v-btn>
            </v-container>
        </v-app-bar>

        <v-main class="bg-grey-lighten-3">
            <v-container>
                <v-row>
                    <v-col cols="2">
                        <v-sheet rounded="lg">
                            <v-list rounded="lg">
                                <v-list>
                                    <template v-for="(menu, i) in menus" :key="i">
                                        <v-list-item link>
                                            <v-list-item-title>
                                                {{ menu.value }}
                                            </v-list-item-title>
                                        </v-list-item>
                                        <v-divider v-if="i < menus.length - 1" :key="`divider-${i}`"></v-divider>
                                    </template>
                                </v-list>
                            </v-list>
                        </v-sheet>
                    </v-col>

                    <v-col>
                        <v-sheet min-height="70vh" rounded>
                            <v-fade-transition mode="out-in">
                                <router-view />
                            </v-fade-transition>
                        </v-sheet>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>
  
<script>
export default {
    data: () => ({
        links: [
            'Image Classification Platform',
        ],
        menus: [
            { value: 'Data Input' },
            { value: 'Data Preparation' },
            { value: 'Model Selection' },
            { value: 'Evaluation' },
            { value: 'Exportation' },
        ]
    }),
}
</script>