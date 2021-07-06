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
        <q-btn v-if="ibanIsNull" flat icon="las la-eye" :disable="loading" :label="$t('table.showWithIban')" @click="toggleIsIbanNull" />
        <q-btn v-if="!ibanIsNull" flat icon="las la-eye-slash" :disable="loading" :label="$t('table.showWithoutIban')" @click="toggleIsIbanNull" />
        <q-btn v-if="selected.length > 0" :disable="ibanIsNull || loading" @click="openXmlGenerator" class="q-ml-sm" icon="las la-money-check-alt" color="primary"  :label="$t('table.remesa')" />
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
    // const $q = useQuasar()

    // Data
    const families = ref<Family[]>([])
    const filter = ref<string | null>(null)
    const isXmlGeneratorOpen = ref(false)
    const ibanIsNull = ref(false)
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
      orderBy,
      ibanIsNull: ibanIsNull.value,
      filter: filter.value
    }
    const sanitizeVariables = cleanObject(variables)
    const { result, onResult, onError, loading, fetchMore, refetch } = adminService.getFamilies(sanitizeVariables)

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
        orderBy,
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
    onError(async () => {
      await router.push('/')
    })

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
      xmlCancel: () => { isXmlGeneratorOpen.value = !isXmlGeneratorOpen.value }
    }
  }

}
</script>

<style>
</style>
