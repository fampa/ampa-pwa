<template>
  <q-page padding class="bg-blue-grey-1">
    <div class="max-900">
      <q-table
        class="content"
        :rows="children"
        :columns="columns"
        row-key="id"
        @row-click="onRowClick"
        v-model:pagination="pagination"
        :loading="loading"
        :filter="filter"
        @request="onRequest"
        :selected-rows-label="getSelectedString"
        selection="multiple"
        binary-state-sort
        sortBy="lastName"
        v-model:selected="selected"
      >
      <template v-slot:top>
        <h2>{{$t('table.children')}}</h2>
        <q-space />
        <q-space />
        <q-input borderless dense debounce="300" v-model="filter" clearable clear-icon="close" :placeholder="$t('table.search')">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-isAdmin="props">
        <q-td :props="props">
          <q-badge v-if="props.value" color="red">
            ADMIN
          </q-badge>
        </q-td>
      </template>

      </q-table>

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="add" color="primary" to="/admin/users/edit" />
      </q-page-sticky>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ref, reactive } from 'vue'
import { cleanObject } from 'src/utilities/cleanObject'
import { AdminService } from 'src/services/admin'
import { formatDate } from 'src/utilities/formatDate'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
// import { useQuasar } from 'quasar'
import { Family } from 'src/models/Family'

export default {
  name: 'AdminMembers',

  emits: ['row-click'],
  setup () {
    const i18n = useI18n()
    const adminService = new AdminService()
    const router = useRouter()
    // const $q = useQuasar()

    // Data
    const children = ref<Family[]>([])
    const filter = ref<string | null>(null)
    const pagination = ref({
      sortBy: 'id',
      descending: true,
      page: 1,
      rowsPerPage: 5,
      rowsNumber: 10
    })
    const selected = ref([])
    const columns = reactive([
      {
        name: 'id',
        required: true,
        label: 'id',
        align: 'left',
        field: 'id',
        sortable: true
      },
      {
        name: 'birthDate',
        required: true,
        label: i18n.t('table.birthday'),
        align: 'left',
        field: 'birthDate',
        format: val => `${formatDate(val)}`,
        sortable: true
      },
      {
        name: 'name',
        required: true,
        label: i18n.t('table.firstName'),
        align: 'left',
        field: 'firstName',
        sortable: true
      },
      {
        name: 'lastName',
        required: true,
        label: i18n.t('table.lastName'),
        align: 'left',
        field: 'lastName',
        sortable: true
      }
    ])

    const getSelectedString = () => {
      return selected.value.length === 0 ? '' : `${selected.value.length} registre${selected.value.length > 1 ? 's' : ''} seleccionats de ${pagination.value.rowsNumber}`
    }

    // Methods
    const onRowClick = (evt, row) => {
      const id = row?.family?.owner?.id
      return router.push(`/admin/family/edit/${id}`)
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
    const { result, onResult, onError, loading, fetchMore } = adminService.getChildren(sanitizeVariables)

    onResult(() => {
      children.value = result.value?.children
      pagination.value.rowsNumber = result.value?.children_aggregate?.aggregate?.count
      // console.log('articles', result.value?.articles)
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
      children.value = more.data.children
      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      pagination.value.sortBy = sortBy
      pagination.value.descending = descending
      pagination.value.rowsNumber = result.value?.children_aggregate?.aggregate?.count
      // console.log('pagination', pagination)
    }

    // Error management

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onError(async () => {
      await router.push('/')
    })

    return {
      children,
      getSelectedString,
      selected,
      pagination,
      columns,
      loading,
      filter,
      onRequest,
      onRowClick
    }
  }

}
</script>

<style>
</style>
