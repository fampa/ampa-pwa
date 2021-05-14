<template>
  <q-page padding class="bg-blue-grey-1">
    <div class="max-900">
      <q-table
        class="content"
        :title="$t('table.members')"
        :rows="members"
        :columns="columns"
        @row-click="onRowClick"
        row-key="id"
        v-model:pagination="pagination"
        :loading="loading"
        :filter="filter"
        @request="onRequest"
        binary-state-sort
        sortBy="lastName"
      >
      <template v-slot:top-right>
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
import { useRouter } from 'vue-router'
import { cleanObject } from 'src/utilities/cleanObject'
import { AdminService } from 'src/services/admin'
import { formatDate } from 'src/utilities/formatDate'
import { Member } from 'src/models/Member'
import { useI18n } from 'vue-i18n'

export default {
  name: 'AdminMembers',
  emits: ['row-click'],
  setup () {
    const i18n = useI18n()
    const router = useRouter()
    const adminService = new AdminService()

    // Data
    const members = ref<Member[]>([])
    const filter = ref<string | null>(null)
    const pagination = ref({
      sortBy: 'lastName',
      descending: false,
      page: 1,
      rowsPerPage: 5,
      rowsNumber: 10
    })
    const columns = reactive([
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
        name: 'lastName',
        required: true,
        label: i18n.t('table.lastName'),
        align: 'left',
        field: 'lastName',
        sortable: true
      },
      {
        name: 'firstName',
        required: true,
        label: i18n.t('table.firstName'),
        align: 'left',
        field: 'firstName',
        sortable: true
      },
      {
        name: 'email',
        required: true,
        label: 'Email',
        align: 'left',
        field: 'email',
        sortable: true
      },
      {
        name: 'isAdmin',
        required: true,
        label: '',
        align: 'right',
        field: 'isAdmin',
        sortable: true
      }
    ])

    // Methods
    const onRowClick = (evt, row) => {
      // console.log(row)
      const id = row.id
      return router.push(`/admin/users/edit/${id}`)
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
    const { result, onResult, loading, fetchMore } = adminService.getMembers(sanitizeVariables)

    onResult(() => {
      members.value = result.value?.members
      pagination.value.rowsNumber = result.value?.members_aggregate?.aggregate?.count
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
      members.value = more.data.members
      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      pagination.value.sortBy = sortBy
      pagination.value.descending = descending
      pagination.value.rowsNumber = result.value?.members_aggregate?.aggregate?.count
      // console.log('pagination', pagination)
    }

    return {
      members,
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
