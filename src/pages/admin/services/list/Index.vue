<template>
  <q-page padding class="bg-blue-grey-1">
    <div class="max-900">
      <q-table
        class="content"
        :title="$t('table.serviceTypes')"
        :rows="services"
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
        <q-btn fab icon="add" color="primary" to="/admin/services/s/edit" />
      </q-page-sticky>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { cleanObject } from 'src/utilities/cleanObject'
import { AdminService } from 'src/services/admin'
import { formatDate } from 'src/utilities/formatDate'
import { GetServicesByTypeInput, Service } from 'src/models/Service'
import { useI18n } from 'vue-i18n'

export default {
  name: 'AdminBlog',
  setup () {
    const i18n = useI18n()
    const router = useRouter()
    const adminService = new AdminService()
    const route = useRoute()

    // Data
    const services = ref<Service[]>([])
    const id = computed(() => Number(route.params?.id))
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
        label: i18n.t('table.date'),
        align: 'left',
        field: 'createdAt',
        format: val => `${formatDate(val)}`,
        sortable: true
      },
      {
        name: 'name',
        required: true,
        label: i18n.t('table.firstName'),
        align: 'left',
        field: 'name',
        sortable: true
      }
    ])

    // Methods
    const onRowClick = (evt, row) => {
      // console.log(row)
      const id = row.id
      return router.push(`/admin/service/edit/${id}`)
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
    const sanitizeVariables = cleanObject(variables) as unknown as GetServicesByTypeInput
    const { result, onResult, loading, fetchMore } = adminService.getServicesByType(sanitizeVariables)

    onResult(() => {
      services.value = result.value?.services
      pagination.value.rowsNumber = result.value?.services_aggregate?.aggregate?.count
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
      const sanitizeVariables = cleanObject(variables) as unknown as GetServicesByTypeInput
      // console.log(sanitizeVariables)
      const more = await fetchMore({
        variables: {
          ...sanitizeVariables
        }
      })
      services.value = more.data.services
      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      pagination.value.sortBy = sortBy
      pagination.value.descending = descending
      pagination.value.rowsNumber = result.value?.services_aggregate?.aggregate?.count
      // console.log('pagination', pagination)
    }

    return {
      services,
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
