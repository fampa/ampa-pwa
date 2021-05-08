<template>
  <router-link class="card" :to="`/s/${service.id}/${slug}`">
    <q-card v-ripple>
      <q-card-section class="card-section">
        <q-item>
          <q-item-section avatar>
              <q-icon
                style="font-size: 4rem;"
                :name="service.image ? service.image : service.type?.icon"
              />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-h6 titular">{{service.name}}</q-item-label>
            <q-item-label caption>
              {{service.description}}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>
  </router-link>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs, computed } from 'vue'
import { Service } from 'src/models/Service'
import { slugify } from 'src/utilities/slugify'

export default defineComponent({
  name: 'ServiceCard',
  props: {
    service: {
      type: Object as PropType<Service>,
      required: true
    }
  },
  setup (props) {
    const slug = computed(() => slugify(props.service.name))
    return {
      ...toRefs(props),
      slug
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
