<template>
  <q-page padding class="bg-blue-grey-1">
    <div class="max-900">
      <q-table
        class="content"
        :rows="families"
        :columns="columns"
        @row-click="onRowClick"
        row-key="id"
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
        <h2>{{$t('table.families')}}</h2>
        <q-space />
        <q-btn flat icon="las la-eye" :disable="loading" :label="inactive ? $t('table.showAlta') : $t('table.showBaixa')" @click="toggleIsBaixa" />
        <q-btn flat icon="las la-eye" :disable="loading" :label="ibanIsNull ? $t('table.showWithIban') : $t('table.showWithoutIban')" @click="toggleIsIbanNull" />
        <q-btn v-if="selected.length > 0" flat icon="las la-file-excel" :disable="loading" :label="$t('table.exportExcel')" @click="exportToExcel" />
        <q-btn v-if="selected.length > 0" :disable="ibanIsNull || loading" @click="openXmlGenerator" class="q-ml-sm" icon="las la-money-check-alt" color="primary"  :label="$t('table.remesa')" />
        <q-btn v-if="selected.length > 0 && !inactive" class="q-ml-sm" color="red" @click="donarBaixa"  :label="$t('table.donarBaixa')" />
        <q-btn v-if="selected.length > 0 && inactive" class="q-ml-sm" color="accent" @click="donarAlta"  :label="$t('table.donarAlta')" />

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

      <h2>ADMIN</h2>
      <q-btn flat icon="las la-broom" :loading="loadingInactive" :disable="loading" label="Neteja families sense xiquets actius" color="red" @click="togglePendingInactive" />

      <!-- <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="add" color="primary" to="/admin/users" />
      </q-page-sticky> -->
      <!-- xml generator -->
      <xml-generator :prompt="isXmlGeneratorOpen" @cancel="xmlCancel" @generate="generateXml($event)"></xml-generator>
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
import SEPA from 'sepa'
import xmlGenerator from 'src/components/xml-generator.vue'
import { useQuasar } from 'quasar'
import { exportToSpreadsheet } from 'src/utilities/exportExcel'

export default {
  name: 'AdminMembers',
  components: {
    xmlGenerator
  },
  emits: ['row-click'],
  setup () {
    const i18n = useI18n()
    const adminService = new AdminService()
    const router = useRouter()
    const $q = useQuasar()

    // Data
    const families = ref<Family[]>([])
    const filter = ref<string | null>(null)
    const isXmlGeneratorOpen = ref(false)
    const ibanIsNull = ref(false)
    const inactive = ref(false)
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
      },
      {
        name: 'iban',
        required: true,
        label: 'IBAN',
        align: 'left',
        field: 'iban',
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

    const getSelectedString = () => {
      return selected.value.length === 0 ? '' : `${selected.value.length} registre${selected.value.length > 1 ? 's' : ''} seleccionats de ${pagination.value.rowsNumber}`
    }

    // Methods
    const onRowClick = (evt, row) => {
      const id = row.owner?.id
      return router.push(`/admin/users/edit/${id}`)
    }

    const limit = pagination.value.rowsPerPage === 0 ? pagination.value.rowsNumber : pagination.value.rowsPerPage
    const offset = (pagination.value.page - 1) * pagination.value.rowsPerPage
    const orderBy = {}
    orderBy[pagination.value.sortBy] = pagination.value.descending ? 'desc' : 'asc'
    const variables = {
      limit,
      offset,
      orderBy: { ...orderBy, id: 'desc' },
      ibanIsNull: ibanIsNull.value,
      filter: filter.value
    }
    const sanitizeVariables = cleanObject(variables)
    const { result, onResult, onError, loading, fetchMore, refetch } = adminService.getFamilies(sanitizeVariables)
    const { result: resultInactive, loading: loadingInactive } = adminService.getFamiliesPendingInactive(sanitizeVariables)

    onResult(() => {
      families.value = result.value?.families
      pagination.value.rowsNumber = result.value?.families_aggregate?.aggregate?.count
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
        orderBy: { ...orderBy, id: 'desc' },
        filter,
        ibanIsNull: ibanIsNull.value
      }
      const sanitizeVariables = cleanObject(variables)
      // console.log(sanitizeVariables)
      const more = await fetchMore({
        variables: {
          ...sanitizeVariables
        }
      })
      families.value = more.data.families
      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      pagination.value.sortBy = sortBy
      pagination.value.descending = descending
      pagination.value.rowsNumber = result.value?.families_aggregate?.aggregate?.count
      // console.log('pagination', pagination)
    }

    const toggleIsIbanNull = async () => {
      ibanIsNull.value = !ibanIsNull.value
      await refetch({ ...variables, ibanIsNull: ibanIsNull.value })
    }

    const { mutate: doInactiveFamilies } = adminService.donarBaixaFamilies()
    const togglePendingInactive = async () => {
      const idsPendingInactive = resultInactive.value?.families.map(f => f.id)
      console.log('idsPendingInactive', idsPendingInactive)
      await doInactiveFamilies({
        ids: idsPendingInactive,
        inactive: true,
        manualPayment: true
      })
      await refetch({ ...variables, ibanIsNull: ibanIsNull.value })
      $q.notify(`Families netejades: ${idsPendingInactive.length}`)
    }

    const toggleIsBaixa = async () => {
      inactive.value = !inactive.value
      await refetch({ ...variables, inactive: inactive.value, ibanIsNull: ibanIsNull.value })
      // getChildren()
    }

    const { mutate } = adminService.donarBaixaFamilies()

    const donarBaixa = async () => {
      const ids = selected.value.map(s => Number(s.id))
      console.log('donarBaixa', ids)
      confirm(i18n.t('admin.baixa')) && (await mutate({
        ids,
        inactive: true,
        manualPayment: true
      })) && (await refetch({ ...variables, ibanIsNull: ibanIsNull.value })) && (selected.value = [])
    }

    const donarAlta = async () => {
      const ids = selected.value.map(s => Number(s.id))
      console.log('donarAlta', ids)
      confirm(i18n.t('admin.alta')) && (await mutate({
        ids,
        inactive: false,
        manualPayment: true
      })) && (await refetch({ ...variables, ibanIsNull: ibanIsNull.value })) && (selected.value = [])
    }

    const openXmlGenerator = () => { isXmlGeneratorOpen.value = true }

    const download = (filename, text) => {
      const element = document.createElement('a')
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
      element.setAttribute('download', filename)

      element.style.display = 'none'
      document.body.appendChild(element)

      element.click()

      document.body.removeChild(element)
    }

    const generateXml = (remesa) => {
      const families = selected.value as Family[]
      const doc = new SEPA.Document('pain.008.001.02')
      doc.grpHdr.id = `XMPL.${Date.now()}.TR0`
      doc.grpHdr.created = new Date()
      doc.grpHdr.initiatorName = `AMPA ${process.env.SCHOOL_NAME}`

      const info = doc.createPaymentInfo()
      info.collectionDate = new Date()
      info.creditorIBAN = process.env.AMPA_IBAN
      info.creditorName = `AMPA ${process.env.SCHOOL_NAME}`
      info.creditorId = process.env.CREDITOR_ID
      info.batchBooking = true // optional
      doc.addPaymentInfo(info)

      for (const family of families) {
        const tx = info.createTransaction()
        tx.debtorName = family.owner ? `${family.owner?.firstName} ${family.owner?.lastName}` : `${family.members[0]?.firstName} ${family.members[0]?.lastName}`
        tx.debtorIBAN = family.iban
        // tx.debtorBIC = family.bic
        tx.mandateId = family.mandateId
        tx.mandateSignatureDate = new Date(family.signatureDate)
        tx.amount = Number(remesa?.amount)
        tx.currency = 'EUR' // optional
        tx.remittanceInfo = remesa?.concept
        // tx.end2endId = 'XMPL.CUST487.INVOICE.54'
        info.addTransaction(tx)
      }

      // console.log(doc.toString())

      download('remesa.xml', doc.toString())
    }

    // Error management

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onError(async (err) => {
      console.error(err)
      await router.push('/')
    })

    const exportToExcel = () => {
      const data = [
        ['Alta', 'Familia', 'IBAN', 'Baixa']
      ]
      families.value.forEach(c => {
        data.push([
          c.createdAt as string,
          c.name,
          c.iban,
          c.inactive ? 'Sí' : 'No'

        ])
      })

      exportToSpreadsheet(data, 'Families')
    }

    return {
      families,
      getSelectedString,
      selected,
      pagination,
      columns,
      loading,
      filter,
      onRequest,
      onRowClick,
      ibanIsNull,
      toggleIsIbanNull,
      generateXml,
      openXmlGenerator,
      isXmlGeneratorOpen,
      xmlCancel: () => { isXmlGeneratorOpen.value = !isXmlGeneratorOpen.value },
      togglePendingInactive,
      loadingInactive,
      donarBaixa,
      donarAlta,
      inactive,
      toggleIsBaixa,
      exportToExcel
    }
  }

}
</script>

<style>
</style>
