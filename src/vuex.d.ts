import { StateInterface } from 'src/store'
import { Store } from 'vuex'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<StateInterface>
  }
}
