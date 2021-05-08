<template>
  <q-page padding class="bg-blue-grey-1">
    <div class="max-900">
      <q-table
        class="content"
        title="Blog"
        :data="articles"
        :columns="columns"
        @row-click="onRowClick"
        row-key="id"
        v-model:pagination="pagination"
        :loading="loading"
        :filter="filter"
        @request="onRequest"
        binary-state-sort
        sortBy="created_at"
      >
      <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" clearable clear-icon="close" :placeholder="$t('table.search')">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

      </q-table>

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="add" color="primary" to="/admin/article/edit" />
      </q-page-sticky>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ref, reactive } from 'vue'
import { Article } from 'src/models/Article'
import { useStore } from 'src/services/store'
import { i18n } from 'src/boot/i18n'
import { useRouter } from 'vue-router'
import { cleanObject } from 'src/utilities/cleanObject'
import { AdminService } from 'src/services/admin'
export default {
  name: 'AdminBlog',
  setup () {
    const store = useStore()
    const currentLanguage = store.state.settings.language
    const fallbackLanguage = store.state.settings.fallbackLanguage
    const translate = i18n.global
    const router = useRouter()
    const adminService = new AdminService()

    // Data
    const articles = ref<Article[]>([])
    const filter = ref<string | null>(null)
    const pagination = reactive({
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
        name: 'created_at',
        required: true,
        label: translate.t('table.date'),
        align: 'left',
        field: 'created_at',
        format: val => `${formatDate(val)}`,
        sortable: true
      },
      {
        name: 'title',
        required: true,
        label: translate.t('table.title'),
        align: 'left',
        field: row => row.translations.find(t => t.language === currentLanguage).title || row.translations.find(t => t.language === fallbackLanguage).title,
        sortable: true
      },
      {
        name: 'status',
        required: true,
        label: translate.t('table.status'),
        align: 'left',
        field: 'status',
        sortable: true
      }
    ])

    // Methods
    const formatDate = (date) => {
      const d = new Date(date)
      let month = `${d.getMonth() + 1}`
      let day = `${d.getDate()}`
      const year = d.getFullYear()
      if (month.length < 2) month = `0${month}`
      if (day.length < 2) day = `0${day}`
      return [day, month, year].join('/')
    }
    const onRowClick = (evt, row) => {
      // console.log(row)
      const id = row.id
      return router.push(`/admin/article/edit/${id}`)
    }

    const limit = pagination.rowsPerPage === 0 ? pagination.rowsNumber : pagination.rowsPerPage
    const offset = (pagination.page - 1) * pagination.rowsPerPage
    const orderBy = {}
    orderBy[pagination.sortBy] = pagination.descending ? 'desc' : 'asc'
    const variables = {
      limit,
      offset,
      orderBy,
      filter: filter.value
    }
    const sanitizeVariables = cleanObject(variables)
    const { result, onResult, loading, refetch } = adminService.getArticles(sanitizeVariables)

    onResult(() => {
      result.value?.articles = articles.value
      console.log('result.value?.articles', result.value)
      result.value?.articles_aggregate?.aggregate?.count = pagination.rowsNumber
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
      await refetch(sanitizeVariables)
    }

    return {
      articles,
      pagination,
      columns,
      loading,
      filter,
      onRowClick,
      onRequest
    }
  }

}
</script>

<style>
</style>
