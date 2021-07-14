<template>
    <q-card>
      <q-card-section>
        <div class="text-h6">{{$t('images.unsplash.title')}}</div>
      </q-card-section>
      <q-card-section>
        <q-input type="text" :label="$t('images.unsplash.input')" v-model="searchWord" @keyup.enter="search"></q-input>
        <q-btn :loading="loading" flat color="primary" :disable="!searchWord" @click="search" :label="$t('images.unsplash.search')" />
      </q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-6" v-for="image in images" :key="image.id">
            <q-img
            class="cursor-pointer"
            style="max-height: 200px;"
            :src="image?.urls?.thumb"
            @click="selectedImage(image)"
            ></q-img>
          </div>
        </div>
        <div class="row">
          <q-btn :loading="loading" @click="searchLess" v-if="page > 1" color="primary"> {{$t('images.unsplash.previous')}}</q-btn>
          <q-btn :loading="loading" @click="searchMore" v-if="images?.length > 0" color="primary">{{$t('images.unsplash.next')}}</q-btn>
        </div>
      </q-card-section>
    </q-card>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import { createApi } from 'unsplash-js'

export default defineComponent({
  emits: ['selected'],
  setup (props, { emit }) {
    const unsplash = createApi({ accessKey: process.env.UNSPLASH_ACCESS_KEY })
    const searchWord = ref('')
    const loading = ref(false)
    const images = ref([])
    const page = ref<number>(1)

    const search = async () => {
      loading.value = true
      console.log(page.value)
      await unsplash.search.getPhotos(
        {
          query: searchWord.value,
          perPage: 10,
          page: page.value
        }
      ).then(result => {
        if (result.errors) {
        // handle error here
          console.error('error occurred: ', result.errors[0])
          loading.value = false
        } else {
          const feed = result.response

          // extract total and results array from response
          const { /* total, */ results } = feed

          // handle success here
          images.value = results
          // console.log(`received ${results.length} photos out of ${total}`)
          console.log('first photo: ', results[0])
          loading.value = false
        }
      })
    }

    const searchMore = async () => {
      page.value++
      await search()
    }

    const searchLess = async () => {
      page.value--
      await search()
    }

    const selectedImage = (img) => {
      const image = {
        url: img?.urls?.regular,
        caption: `Photo by <a href="${img?.user?.links?.html}?utm_source=AMPA_OBERTA&utm_medium=referral" target="_blank">${img?.user?.first_name} ${img?.user?.last_name ? img?.user?.last_name : ''}</a> on <a href="https://unsplash.com/?utm_source=AMPA_OBERTA&utm_medium=referral" target="_blank">Unsplash</a>`
      }
      emit('selected', image)
    }

    return {
      searchWord,
      loading,
      search,
      images,
      selectedImage,
      page,
      searchMore,
      searchLess
    }
  }
})
</script>
