<template>
  <q-page padding class="bg-blue-grey-1">
    <div class="max-900">
      <q-table
        class="content"
        :title="$t(`table.${type}`)"
        :rows="contents"
        :columns="columns"
        @row-click="onRowClick"
        row-key="id"
        v-model:pagination="pagination"
        :loading="loading"
        :filter="filter"
        @request="onRequest"
        binary-state-sort
        sortBy="createdAt"
      >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" clearable clear-icon="close" :placeholder="$t('table.search')">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-isPublished="props">
        <q-td :props="props">
          <q-badge :color="props.value === ('Publicat' || 'Publicado') ? 'positive' : 'warning'">
            {{props.value}}
          </q-badge>
        </q-td>
      </template>

      </q-table>

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="add" color="primary" :to="`/admin/${type}/edit`" />
      </q-page-sticky>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ref, reactive, computed } from 'vue'
import { useStore } from 'src/services/store'
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'
import { cleanObject } from 'src/utilities/cleanObject'
import { AdminService } from 'src/services/admin'
import { formatDate } from 'src/utilities/formatDate'
import { useI18n } from 'vue-i18n'
import { Content } from 'src/models/Content'

export default {
  name: 'AdminPages',
  beforeRouteEnter (to, from, next) {
    // called before the route that renders this component is confirmed.
    // does NOT have access to `this` component instance,
    // because it has not been created yet when this guard is called!
    const allowedTypes = ['page', 'article', 'service', 'tag']
    if (allowedTypes.includes(to.params?.type as string)) {
      next()
    } else {
      next('/')
    }
  },
  setup () {
    const store = useStore()
    const currentLanguage = store.state.settings.language
    const fallbackLanguage = store.state.settings.fallbackLanguage
    const i18n = useI18n()
    const router = useRouter()
    const route = useRoute()
    const type = computed(() => route.params?.type as string)
    const adminService = new AdminService()

    // Data
    const contents = ref<Content[]>([])
    const filter = ref<string | null>(null)
    const pagination = ref({
      sortBy: 'createdAt',
      descending: true,
      page: 1,
      rowsPerPage: 5,
      rowsNumber: 10
    })
    const columns = reactive([
      {
        name: 'id',
        required: true,
        label: 'ID',
        align: 'left',
        field: 'id',
        sortable: true
      },
      {
        name: 'isPublished',
        required: true,
        label: i18n.t('table.status'),
        format: val => val ? i18n.t('content.published') : i18n.t('content.draft'),
        align: 'left',
        field: 'isPublished',
        sortable: true
      },
      {
        name: 'title',
        required: true,
        label: i18n.t('table.title'),
        align: 'left',
        field: row => row.translations?.find(t => t.language === currentLanguage).title || row.translations?.find(t => t.language === fallbackLanguage).title,
        sortable: true
      },
      {
        name: 'createdAt',
        required: true,
        label: i18n.t('table.date'),
        align: 'left',
        field: 'createdAt',
        format: val => `${formatDate(val)}`,
        sortable: true
      }
    ])

    // Methods
    const onRowClick = (evt, row) => {
      // console.log(row)
      const id = row.id
      return router.push(`/admin/${type.value}/edit/${id}`)
    }

    const limit = pagination.value.rowsPerPage === 0 ? pagination.value.rowsNumber : pagination.value.rowsPerPage
    const offset = (pagination.value.page - 1) * pagination.value.rowsPerPage
    const orderBy = {}
    orderBy[pagination.value.sortBy] = pagination.value.descending ? 'desc' : 'asc'
    const variables = {
      limit,
      offset,
      orderBy,
      filter: filter.value,
      type: type.value
    }
    const sanitizeVariables = cleanObject(variables)
    const { result, onResult, loading, fetchMore, refetch } = adminService.getContentsByType(sanitizeVariables)

    onResult(() => {
      contents.value = result.value?.content
      pagination.value.rowsNumber = result.value?.content_aggregate?.aggregate?.count
      // console.log('contents', result.value?.contents)
    })

    const onRequest = async (props) => {
      const {
        page,
        rowsPerPage,
        rowsNumber,
        sortBy,
        descending
      } = props.pagination
      const filter = props.filter ? `%${props.filter}%` : null
      const limit = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const offset = (page - 1) * rowsPerPage
      const orderBy = {}
      orderBy[sortBy] = descending ? 'desc' : 'asc'
      const variables = {
        limit,
        offset,
        orderBy,
        filter
      }
      const sanitizeVariables = cleanObject(variables)
      // console.log(sanitizeVariables)
      const more = await fetchMore({
        variables: {
          ...sanitizeVariables
        }
      })
      contents.value = more.data.content
      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      pagination.value.sortBy = sortBy
      pagination.value.descending = descending
      pagination.value.rowsNumber = result.value?.content_aggregate?.aggregate?.count
      // console.log('pagination', pagination)
    }

    onBeforeRouteUpdate(async (to, _) => {
      const type = to.params?.type.toString()
      const newVariables = { ...variables, type }
      await refetch(newVariables)
    })

    return {
      contents,
      pagination,
      columns,
      loading,
      filter,
      onRowClick,
      onRequest,
      type,
      refetch
    }
  }

}
</script>

<style>
</style>
