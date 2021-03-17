// Mocks all files ending in `.vue` showing them as plain Vue instances
declare module '*.vue' {
  import { ComponentOptions } from 'vue'
  const component: ComponentOptions
  export default component
}

declare module '*.gql' {
  import { DocumentNode } from 'graphql'

  const content: DocumentNode
  export default content
}
