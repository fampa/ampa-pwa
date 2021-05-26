<template>
  <q-page padding class="bg-grey-2 q-pa-md">
    <div class="max-900">
      <q-table
        class="content"
        :title="$t('table.tags')"
        :rows="tags"
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
      <template v-slot:body-cell-icon="props">
        <q-td :props="props">
          <q-icon :name="props.value">
          </q-icon>
        </q-td>
      </template>

      </q-table>

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="add" color="primary" to="/admin/tags/edit" />
      </q-page-sticky>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { cleanObject } from 'src/utilities/cleanObject'
import { AdminService } from 'src/services/admin'
import { useI18n } from 'vue-i18n'
import { Tag } from 'src/models/Tag'
import { QueryTableOptions } from 'src/models/QueryTable'
import { useStore } from 'src/services/store'

export default {
  name: 'AdminBlog',
  setup () {
    const i18n = useI18n()
    const router = useRouter()
    const adminService = new AdminService()
    const route = useRoute()
    const store = useStore()
    const currentLanguage = computed(() => store.state.settings.language)
    const fallbackLanguage = computed(() => store.state.settings.fallbackLanguage)

    // Data
    const tags = ref<Tag[]>([])
    const id = computed(() => Number(route.params?.id))
    const filter = ref<string | null>(null)
    const pagination = ref({
      sortBy: 'id',
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
        name: 'name',
        required: true,
        label: i18n.t('table.firstName'),
        align: 'left',
        field: row => row.translations.find(t => t.language === currentLanguage.value).name || row.translations.find(t => t.language === fallbackLanguage.value).name,
        sortable: true
      },
      {
        name: 'type',
        required: true,
        label: i18n.t('content.type.title'),
        align: 'left',
        field: 'type',
        format: val => i18n.t(`content.type.${val}`),
        sortable: true
      }
    ])

    // Methods
    const onRowClick = (evt, row) => {
      // console.log(row)
      const id = row.id
      return router.push(`/admin/tags/edit/${id}`)
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
      typeId: id.value
    }
    const sanitizeVariables = cleanObject(variables) as unknown as QueryTableOptions
    const { result, onResult, loading, fetchMore } = adminService.getTags(sanitizeVariables)

    onResult(() => {
      tags.value = result.value?.tags
      pagination.value.rowsNumber = result.value?.tags_aggregate?.aggregate?.count
      // console.log('service_types', result.value?.service_types)
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
        filter,
        typeId: id.value
      }
      const sanitizeVariables = cleanObject(variables) as unknown as QueryTableOptions
      // console.log(sanitizeVariables)
      const more = await fetchMore({
        variables: {
          ...sanitizeVariables
        }
      })
      tags.value = more.data.tags
      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      pagination.value.sortBy = sortBy
      pagination.value.descending = descending
      pagination.value.rowsNumber = result.value?.tags_aggregate?.aggregate?.count
      // console.log('pagination', pagination)
    }

    return {
      tags,
      pagination,
      columns,
      loading,
      filter,
      onRowClick,
      onRequest,
      id
    }
  }

}
</script>

<style>
</style>
