<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          AMPA
        </q-toolbar-title>

        <q-btn-dropdown dropdown-icon="more_vert" flat rounded no-icon-animation >
          <q-list>
            <q-item :to="'/settings'" clickable v-close-popup>
              <q-item-section>
                <q-item-label>{{$t('settings')}}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
    <q-img class="absolute-top" src="~assets/img/material.png" style="height: 150px">
      <div class="buttons">
        <q-btn
          flat
          v-if="user"
          text-color="white"
          @click="logout"
          :label="$t('logout')"
          class="float-right login"
        />
        <q-btn
          flat
          v-if="!user"
          text-color="white"
          to="/login"
          @click="toggleLeftDrawer"
          :label="$t('login')"
          class="float-right login"
        />
      </div>
          <div v-if="user" class="absolute-bottom bg-transparent">
            <q-avatar size="56px" class="q-mb-sm">
              <img :src="user.photoURL ? user.photoURL : '/icons/icon-128x128.png'">
            </q-avatar>
            <div class="text-weight-bold">{{user.email}}</div>
            <div v-if="isAdmin">
              <q-badge color="primary">
                  Administrador
              </q-badge>
            </div>
          </div>
        </q-img>
    <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd">
      <q-list padding>
        <q-item v-for="(item, index) in items" :key="index" clickable v-ripple :to="item.to" exact>
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{item.title}}</q-item-section>
        </q-item>
        <div v-if="pagesItems">
          <q-item v-for="(item, index) in pagesItems" :key="index" clickable v-ripple :to="item.to" exact>
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>
              {{item.title}}
            </q-item-section>
          </q-item>
        </div>
        <div v-if="serviceItems">
          <q-separator />
            <q-item>
              <q-item-section>
                  <q-item-label overline>{{$t('menu.AmpaServices')}}</q-item-label>
              </q-item-section>
            </q-item>
          <q-item v-for="(item, index) in serviceItems" :key="index" clickable v-ripple :to="item.to" exact>
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>
              {{item.title}}
            </q-item-section>
          </q-item>
        </div>
        <div v-if="user">
          <q-separator />
            <q-item>
              <q-item-section>
                  <q-item-label overline>{{$t('menu.YourData')}}</q-item-label>
              </q-item-section>
            </q-item>
          <q-item v-for="(item, index) in userItems" :key="index" clickable v-ripple :to="item.to" exact>
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>
              {{item.title}}
            </q-item-section>
          </q-item>
          <div v-if="isAdmin">
            <q-separator />
            <q-item>
              <q-item-section>
                  <q-item-label overline>ADMIN</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-for="(item, index) in adminItems" :key="index" clickable v-ripple :to="item.to">
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>{{item.title}}</q-item-section>
            </q-item>
          </div>
        </div>
      </q-list>
    </q-scroll-area>
    </q-drawer>
      <q-page-container>
        <router-view>
        </router-view>
      </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import { i18n } from 'src/boot/i18n'
import { useStore } from 'src/services/store'
import { ContentsService } from 'src/services/contents'
import { slugify } from 'src/utilities/slugify'
export default defineComponent({
  name: 'MainLayout',

  setup () {
    const leftDrawerOpen = ref(false)
    const translate = i18n.global
    const store = useStore()
    const contentsService = new ContentsService()
    const currentLanguage = computed(() => store.state.settings.language)

    const user = computed(() => {
      return store.state.user.user
    })

    interface menuItem {
      title: string
      icon: string
      to: string
    }

    const serviceItems = ref<menuItem[]>([])

    const { result: ServicesResult, onResult: onServicesResult } = contentsService.getTipusServeis()

    onServicesResult(() => {
      serviceItems.value = ServicesResult.value?.service_types?.map(service => {
        return {
          title: service.name,
          icon: service.icon,
          to: `/service/${service.id}/${slugify(service.name)}`
        }
      })
    })

    const pagesItems = ref<menuItem[]>([])

    const { result: PagesResult, onResult: onPagesResult } = contentsService.getPagesList()
    const getPageItems = () => {
      pagesItems.value = PagesResult.value?.pages?.map(page => {
        const title = page.translations?.find(p => p.language === currentLanguage.value)?.title
        return {
          title,
          icon: page.icon,
          to: `/p/${page.id}/${slugify(title)}`
        }
      })
    }
    onPagesResult(() => {
      getPageItems()
    })

    watch(() => currentLanguage.value,
      (newVal, oldVal) => {
        console.log(newVal)
        if (newVal !== oldVal) {
          getPageItems()
        }
      })

    const items = computed(() => {
      return [
        {
          title: translate.t('home'),
          icon: 'las la-home',
          to: '/'
        }
      ]
    })

    const userItems = computed(() => {
      return [
        {
          title: translate.t('personalData'),
          icon: 'las la-user',
          to: '/user'
        },
        {
          title: translate.t('member.familyData'),
          icon: 'las la-child',
          to: '/user/family'
        },
        {
          title: translate.t('member.paymentData'),
          icon: 'las la-money-check-alt',
          to: '/user/payment'
        }
      ]
    })

    const adminItems = computed(() => {
      return [
        {
          title: translate.t('admin.users'),
          icon: 'las la-users',
          to: '/admin/users'
        }
      ]
    })

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    const logout = async () => {
      await store.dispatch('user/logout')
      toggleLeftDrawer()
    }

    const isAdmin = computed(() => store.state.user.isAdmin)

    return {
      items,
      userItems,
      adminItems,
      serviceItems,
      pagesItems,
      user,
      leftDrawerOpen,
      logout,
      toggleLeftDrawer,
      isAdmin
    }
  }
})
</script>

<style lang="scss" scoped>
.buttons {
  position: absolute;
  padding: 16px;
  background: transparent;
  right: 0;
  z-index: 999;
}
</style>
