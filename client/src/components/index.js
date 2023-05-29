import { createApp } from 'vue'
import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'

// Import the Vuetify components from the core directory
const requireComponent = require.context(
  './core', true, /\.vue$/
)

// Create the Vue app
const app = createApp({})

// Register the Vuetify components dynamically
requireComponent.keys().forEach((fileName) => {
  const componentConfig = requireComponent(fileName)

  const componentName = upperFirst(
    camelCase(fileName.replace(/^\.\//, '').replace(/\.\w+$/, ''))
  )

  app.component(componentName, componentConfig.default || componentConfig)
})

// Mount the app to the #app element
app.mount('#app')
