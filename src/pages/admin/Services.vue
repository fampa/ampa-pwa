<template>
  <q-page padding class="bg-blue-grey-1">
    <div class="max-900">
      <q-table
        class="content"
        :title="$t('table.serviceTypes')"
        :rows="serviceTypes"
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
        <q-btn fab icon="add" color="primary" to="/admin/article/edit" />
      </q-page-sticky>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ref, reactive } from 'vue'
import { i18n } from 'src/boot/i18n'
import { useRouter } from 'vue-router'
import { cleanObject } from 'src/utilities/cleanObject'
import { AdminService } from 'src/services/admin'
import { formatDate } from 'src/utilities/formatDate'
import { ServiceType } from 'src/models/Service'

export default {
  name: 'AdminBlog',
  setup () {
    const translate = i18n.global
    const router = useRouter()
    const adminService = new AdminService()

    // Data
    const serviceTypes = ref<ServiceType[]>([])
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
        name: 'createdAt',
        required: true,
        label: translate.t('table.date'),
        align: 'left',
        field: 'createdAt',
        format: val => `${formatDate(val)}`,
        sortable: true
      },
      {
        name: 'name',
        required: true,
        label: translate.t('table.firstName'),
        align: 'left',
        field: 'name',
        sortable: true
      },
      {
        name: 'icon',
        required: false,
        label: '',
        align: 'left',
        field: 'icon',
        sortable: false
      }
    ])

    // Methods
    const onRowClick = (evt, row) => {
      // console.log(row)
      const id = row.id
      return router.push(`/admin/services/edit/${id}`)
    }

    const limit = pagination.value.rowsPerPage === 0 ? pagination.value.rowsNumber : pagination.value.rowsPerPage
    const offset = (pagination.value.page - 1) * pagination.value.rowsPerPage
    const orderBy = {}
    orderBy[pagination.value.sortBy] = pagination.value.descending ? 'desc' : 'asc'
    const variables = {
      limit,
      offset,
      orderBy,
      filter: filter.value
    }
    const sanitizeVariables = cleanObject(variables)
    const { result, onResult, loading, fetchMore } = adminService.getServiceTypes(sanitizeVariables)

    onResult(() => {
      serviceTypes.value = result.value?.service_types
      pagination.value.rowsNumber = result.value?.service_types_aggregate?.aggregate?.count
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
        filter
      }
      const sanitizeVariables = cleanObject(variables)
      // console.log(sanitizeVariables)
      const more = await fetchMore({
        variables: {
          ...sanitizeVariables
        }
      })
      serviceTypes.value = more.data.service_types
      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      pagination.value.sortBy = sortBy
      pagination.value.descending = descending
      pagination.value.rowsNumber = result.value?.service_types_aggregate?.aggregate?.count
      // console.log('pagination', pagination)
    }

    return {
      serviceTypes,
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
