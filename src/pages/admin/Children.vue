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
        <q-btn flat icon="las la-eye" :disable="loading" :label="inactive ? $t('table.showAlta') : $t('table.showBaixa')" @click="toggleIsBaixa" />
        <q-btn v-if="selected.length > 0" flat icon="las la-file-excel" :disable="loading" :label="$t('table.exportExcel')" @click="exportToExcel" />
        <!-- <q-select v-model="grade" :options="GRADES" @update:modelValue="gradeSelected()" :label="$t('member.grade')" emit-value map-options style="min-width: 6rem;" /> -->
        <q-btn v-if="selected.length > 0" class="q-ml-sm" color="red" @click="donarBaixa"  :label="inactive ? $t('table.donarAlta') : $t('table.donarBaixa')" />
        <q-space />
        <q-input borderless dense debounce="300" v-model="filter" clearable clear-icon="close" :placeholder="$t('table.search')">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-inactive="props">
        <q-td :props="props">
          <q-badge v-if="props.value" color="red">
            BAIXA
          </q-badge>
        </q-td>
      </template>

      </q-table>

      <section>
        <h2>ADMIN</h2>
        <q-btn flat icon="las la-broom" @click="annualIncrement" :label="$t('admin.annualIncrement')" /> WIP
      </section>

      <!-- <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="add" color="primary" to="/admin/users/edit" />
      </q-page-sticky> -->
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
import type { Child } from 'src/models/Child'
// import { useQuasar } from 'quasar'
import { exportToSpreadsheet } from 'src/utilities/exportExcel'

export default {
  name: 'AdminMembers',

  emits: ['row-click'],
  setup () {
    const i18n = useI18n()
    const adminService = new AdminService()
    const router = useRouter()
    // const $q = useQuasar()

    // Data
    const children = ref<Child[]>([])
    const filter = ref<string | null>(null)
    const pagination = ref({
      sortBy: 'id',
      descending: true,
      page: 1,
      rowsPerPage: 5,
      rowsNumber: 10
    })
    const grade = ref<number | null>(null)
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
      },
      {
        name: 'grade',
        required: true,
        label: i18n.t('member.grade'),
        align: 'left',
        field: val => GRADES.find(g => g.value === val.grade)?.label,
        sortable: true
      },
      {
        name: 'inactive',
        required: true,
        label: '',
        align: 'left',
        field: 'inactive',
        sortable: true
      }
    ])

    const GRADES = [
      {
        value: -2,
        label: i18n.t('grade.infantil1')
      },
      {
        value: -1,
        label: i18n.t('grade.infantil2')
      },
      {
        value: 0,
        label: i18n.t('grade.infantil3')
      },
      {
        value: 1,
        label: i18n.t('grade.primaria1')
      },
      {
        value: 2,
        label: i18n.t('grade.primaria2')
      },
      {
        value: 3,
        label: i18n.t('grade.primaria3')
      },
      {
        value: 4,
        label: i18n.t('grade.primaria4')
      },
      {
        value: 5,
        label: i18n.t('grade.primaria5')
      },
      {
        value: 6,
        label: i18n.t('grade.primaria6')
      }
    ]

    const getSelectedString = () => {
      return selected.value.length === 0 ? '' : `${selected.value.length} registre${selected.value.length > 1 ? 's' : ''} seleccionats de ${pagination.value.rowsNumber}`
    }

    const inactive = ref(false)

    // Methods
    const onRowClick = (evt, row) => {
      const id = row?.family?.owner?.id
      return router.push(`/admin/family/edit/${id}`)
    }
    const { mutate } = adminService.donarBaixaChildren()

    const donarBaixa = async () => {
      const ids = selected.value.map(s => Number(s.id))
      console.log('donarBaixa', ids)
      const variables = {
        ids,
        inactive: !inactive.value
      }

      await mutate(variables).then(res => {
        console.log('donarBaixa', res)
      }).catch(err => {
        console.log('donarBaixa', err)
      }).finally(() => {
        selected.value = []
      })
      await refetch()
    }

    const limit = pagination.value.rowsPerPage === 0 ? pagination.value.rowsNumber : pagination.value.rowsPerPage
    const offset = (pagination.value.page - 1) * pagination.value.rowsPerPage
    const orderBy = {}
    orderBy[pagination.value.sortBy] = pagination.value.descending ? 'desc' : 'asc'
    const variables = {
      limit,
      offset,
      orderBy: { ...orderBy, id: orderBy[pagination.value.sortBy] },
      grade: grade.value,
      inactive: inactive.value,
      filter: filter.value
    }
    const sanitizeVariables = cleanObject(variables)
    const { result, onResult, onError, loading, fetchMore, refetch } = adminService.getChildren(sanitizeVariables)

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
        orderBy: { ...orderBy, id: orderBy[sortBy] },
        grade: grade.value,
        inactive: inactive.value,
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

    const toggleIsBaixa = async () => {
      inactive.value = !inactive.value
      await refetch({ ...variables, inactive: inactive.value })
      // getChildren()
    }

    const annualIncrement = () => {
      const newKids = ref<Child[]>([])
      const ids = ref<number[]>([])
      const { result, onResult } = adminService.getChildren({
      })

      onResult(() => {
        result.value?.children?.forEach(c => {
          const newChild = { ...c }
          ids.value.push(c.id)
          if (newChild.grade === 6) {
            newChild.inactive = true
          } else {
            newChild.grade++
          }
          newKids.value = [...newKids.value, newChild]
        })
        // TODO update children
        console.log('annualIncrement', newKids.value)
        console.log('ids', ids.value)
      })
    }

    // const gradeSelected = async () => {
    //   console.log('gradeSelected', grade.value)
    //   await refetch({ ...variables, grade: grade.value })
    // }

    // Error management

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onError(async () => {
      await router.push('/')
    })

    // Export to excel
    const exportToExcel = () => {
      const data = [
        ['Nom', 'Cognoms', 'Data naixement', 'Curs', 'Grup', 'Baixa']
      ]
      children.value.forEach(c => {
        data.push([
          c.firstName,
          c.lastName,
          c.birthDate,
          c.grade === 0 ? 'Infantil 3' : c.grade === -1 ? 'Infantil 2' : c.grade === -2 ? 'Infantil 1' : c.grade === 1 ? 'Primària 1' : c.grade === 2 ? 'Primària 2' : c.grade === 3 ? 'Primària 3' : c.grade === 4 ? 'Primària 4' : c.grade === 5 ? 'Primària 5' : c.grade === 6 ? 'Primària 6' : '',
          c.group,
          c.inactive ? 'Sí' : 'No'

        ])
      })

      exportToSpreadsheet(data, 'Alumnes')
    }

    return {
      children,
      getSelectedString,
      selected,
      pagination,
      columns,
      loading,
      filter,
      onRequest,
      onRowClick,
      inactive,
      toggleIsBaixa,
      donarBaixa,
      annualIncrement,
      grade,
      // gradeSelected,
      GRADES,
      exportToExcel
    }
  }

}
</script>

<style>
</style>
