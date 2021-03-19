import { StateInterface } from 'src/store'
import { InjectionKey } from 'vue'
import { useStore as baseUseStore, Store } from 'vuex'

export const key: InjectionKey<Store<StateInterface>> = Symbol('vuex')

export function useStore () {
  return baseUseStore(key)
}
