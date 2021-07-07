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
          AMPA {{schoolName}}
        </q-toolbar-title>

        <q-btn-dropdown aria-label="messages-button" v-if="member" dropdown-icon="las la-bell" :label="member?.messages_aggregate?.aggregate?.count" flat rounded no-icon-animation>
          <q-list>
            <q-item v-if="member?.messages?.length === 0" class="message" clickable v-close-popup>
              <q-item-section>
                <q-item-label>{{$t('messages.empty')}}</q-item-label>
              </q-item-section>
              <q-item-section avatar>
                <q-icon name="las la-comments" />
              </q-item-section>
            </q-item>
            <q-item class="message" :class="{unRead: !m.read}" v-for="m in member.messages" :key="m.message.id" :to="`/user/message/${m.message.id}`" clickable v-close-popup>
              <q-item-section>
                <q-item-label>{{m.message.title}}</q-item-label>
                <q-item-label caption>{{date.formatDate(m.message.createdAt, 'DD/MM/YYYY HH:mm')}}</q-item-label>
              </q-item-section>
              <q-item-section avatar>
                <q-icon :name="m.read ? 'las la-eye' : 'las la-low-vision'" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn-dropdown aria-label="settings-dropdown-button" dropdown-icon="more_vert" flat rounded no-icon-animation >
          <q-list>
            <q-item :to="'/settings'" clickable v-close-popup>
              <q-item-section>
                <q-item-label>{{$t('settings.title')}}</q-item-label>
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
              <q-badge color="accent">
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
        <q-item clickable v-ripple to="/contact" exact>
            <q-item-section avatar>
              <q-icon name="las la-envelope" />
            </q-item-section>
            <q-item-section>
              {{$t('menu.contact')}}
            </q-item-section>
          </q-item>
        <div v-if="tagItems">
          <q-separator />
            <q-item>
              <q-item-section>
                  <q-item-label overline>{{$t('menu.featured')}}</q-item-label>
              </q-item-section>
            </q-item>
          <q-item v-for="(item, index) in tagItems" :key="index" clickable v-ripple :to="item.to" exact>
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>
              {{item.title}}
            </q-item-section>
          </q-item>
        </div>
        <div v-if="linkItems">
          <q-separator />
            <q-item>
              <q-item-section>
                  <q-item-label overline>{{$t('menu.link')}}</q-item-label>
              </q-item-section>
            </q-item>
          <q-item v-for="(item, index) in linkItems" :key="index" clickable v-ripple @click="goTo(item.to)" exact>
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
import { defineComponent, ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'src/services/store'
import { ContentsService } from 'src/services/contents'
import { useI18n } from 'vue-i18n'
import { fallbackContent } from 'src/utilities/fallbackContent'
import { date, useQuasar } from 'quasar'
import firebase from 'firebase/app'
import 'firebase/messaging'

export default defineComponent({
  name: 'MainLayout',

  setup () {
    const leftDrawerOpen = ref(false)
    const i18n = useI18n()
    const store = useStore()
    const $q = useQuasar()
    let messaging
    if (firebase.messaging.isSupported()) {
      messaging = firebase.messaging()
    }
    const contentsService = new ContentsService()
    const currentLanguage = computed(() => store.state.settings.language)
    const schoolName = process.env.SCHOOL_NAME
    const user = computed(() => {
      return store.state.user.user
    })
    const member = computed(() => {
      return store.state.user.member
    })

    interface menuItem {
      title: string
      icon: string
      to: string
    }

    const tagItems = ref<menuItem[]>([])

    const linkItems = ref<menuItem[]>([])

    const pagesItems = ref<menuItem[]>([])

    const { result: menuItems, onResult: onMenuItemsResult } = contentsService.getMenuItems()
    const getMenuItems = () => {
      pagesItems.value = menuItems.value?.content?.filter(m => m.type === 'page').map(page => {
        const title = fallbackContent(page, 'title')
        return {
          title,
          icon: page.icon,
          to: `/page/${page.id}/${fallbackContent(page, 'slug')}`
        }
      })

      tagItems.value = menuItems.value?.content?.filter(m => m.type === 'tag').map(page => {
        const title = fallbackContent(page, 'title')
        return {
          title,
          icon: page.icon,
          to: `/tag/${page.id}/${fallbackContent(page, 'slug')}`
        }
      })

      linkItems.value = menuItems.value?.content?.filter(m => m.type === 'link').map(page => {
        const title = fallbackContent(page, 'title')
        return {
          title,
          icon: page.icon,
          to: page.link
        }
      })
    }
    onMenuItemsResult(() => {
      getMenuItems()
    })

    onMounted(() => {
      if (!firebase.messaging.isSupported()) return
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      messaging.onMessage(async (payload) => {
        console.log('[firebase-messaging-sw.js] Received foreground message ', payload)
        await store.dispatch('user/setUser', user.value.uid)
        $q.notify({
          type: 'info',
          timeout: 0,
          message: payload.notification?.title,
          caption: date.formatDate(payload.notification?.timestamp, 'DD/MM/YYYY HH:mm'),
          avatar: payload.notification?.badge,
          actions: [
            {
              label: i18n.t('notification.close'),
              color: 'white',
              attrs: {
                'aria-label': 'Dismiss'
              }
            },
            {
              label: i18n.t('notification.read'),
              color: 'white',
              handler: () => {
                window.location.href = payload.notification?.click_action
              }
            }
          ]
        })
      })
    })

    watch(() => currentLanguage.value,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          getMenuItems()
        }
      })

    const items = computed(() => {
      return [
        {
          title: i18n.t('home'),
          icon: 'las la-home',
          to: '/'
        }
      ]
    })

    const userItems = computed(() => {
      return [
        {
          title: i18n.t('personalData'),
          icon: 'las la-id-card',
          to: '/user'
        },
        {
          title: i18n.t('member.familyData'),
          icon: 'las la-child',
          to: '/user/family'
        },
        {
          title: i18n.t('member.paymentData'),
          icon: 'las la-money-check-alt',
          to: '/user/payment'
        }
      ]
    })

    const adminItems = computed(() => {
      return [
        {
          title: i18n.t('admin.users'),
          icon: 'las la-users',
          to: '/admin/users'
        },
        {
          title: i18n.t('admin.family'),
          icon: 'las la-users-cog',
          to: '/admin/families'
        },
        {
          title: i18n.t('admin.pages'),
          icon: 'las la-file-alt',
          to: '/admin/page'
        },
        {
          title: i18n.t('admin.services'),
          icon: 'las la-list',
          to: '/admin/service'
        },
        {
          title: i18n.t('admin.blog'),
          icon: 'las la-rss',
          to: '/admin/article'
        },
        {
          title: i18n.t('admin.tags'),
          icon: 'las la-tags',
          to: '/admin/tag'
        },
        {
          title: i18n.t('admin.link'),
          icon: 'las la-external-link-alt',
          to: '/admin/link'
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
      tagItems,
      pagesItems,
      user,
      leftDrawerOpen,
      logout,
      toggleLeftDrawer,
      isAdmin,
      member,
      date,
      schoolName,
      linkItems,
      goTo: (to) => window.open(to, '_blank')
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
.message{
  opacity: 0.5;
}
.unRead {
  font-weight: 700;
  opacity: 1;
}
</style>
