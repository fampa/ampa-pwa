<template>
  <router-link class="card" :to="`/${article.type}/${article.id}/${fallbackContent(article, 'slug')}`">
    <q-card class="news-card" v-ripple>
      <div class="img-container">
        <q-img
          :src="article.image"
          class="image-placeholder"
          fit="cover"
        >
          <div class="row bg-transparent">
            <div v-for="(t, index) in article.tags" :key="index">
              <div v-for="(tr, index) in t?.tag?.translations" :key="index">
                <q-chip class="col" dense v-if="tr.language === $store.state.settings.language" color="accent" text-color="white" icon="las la-tag">
                  {{fallbackContent(t.tag, 'title')}}
                </q-chip>
              </div>
            </div>
          </div>
        </q-img>
      </div>
      <q-card-section class="card-section">
        <div class="text-h6 titular">
          {{fallbackContent(article, 'title')}}
          <q-tooltip>
            {{fallbackContent(article, 'title')}}
          </q-tooltip>
        </div>
        <div class="row justify-between">
          <div v-if="article.type === 'article'" class="text-subtitle2">{{formatedDate}}</div>
        </div>
      </q-card-section>
    </q-card>
  </router-link>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs, computed } from 'vue'
import { date } from 'quasar'
import { Content } from 'src/models/Content'
import { fallbackContent } from 'src/utilities/fallbackContent'

export default defineComponent({
  name: 'NewsCard',
  props: {
    article: {
      type: Object as PropType<Content>,
      required: true
    }
  },
  setup (props) {
    const formatedDate = computed(() => date.formatDate(props.article.createdAt, 'DD/MM/YYYY'))
    return {
      ...toRefs(props),
      date,
      formatedDate,
      fallbackContent
    }
  }
})
</script>

<style lang="scss" scoped>
.img-container {
  overflow: hidden;
}
.image-placeholder {
  height: 200px;
  background: linear-gradient($primary, $accent);
  transition: transform 0.3s ease-in-out;
}
.image-placeholder:hover {
  transform: scale(1.2);
  transition: transform 0.3s ease-in-out;
}
.titular {
  height: 65px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
}
.text-subtitle2 {
  opacity: 0.7;
}
</style>
