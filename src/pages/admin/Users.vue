<template>
  <q-page padding class="bg-blue-grey-1">
    <div class="max-900">
      <q-table
        class="content"
        :rows="members"
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
        sortBy="createdAt"
        v-model:selected="selected"
      >
      <template v-slot:top>
        <h2>{{$t('table.members')}}</h2>
        <q-space />
        <q-btn flat icon="las la-eye" :disable="loading" :label="inactive ? $t('table.showAlta') : $t('table.showBaixa')" @click="toggleIsBaixa" />
        <q-btn v-if="selected.length > 0" flat icon="las la-file-excel" :disable="loading" :label="$t('table.exportExcel')" @click="exportToExcel" />
        <q-btn v-if="selected.length > 0" :loading="sendingMessage" @click="openSendMessage = true" class="q-ml-sm" icon="las la-envelope" color="primary" :disable="loading" :label="$t('table.sendMessage')" />
        <q-space />
        <q-input borderless dense debounce="300" v-model="filter" clearable clear-icon="close" :placeholder="$t('table.search')">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-isAdmin="props">
        <q-td :props="props">
          <q-badge v-if="props.value" color="accent">
            ADMIN
          </q-badge>
        </q-td>
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
      <p class="notice">*{{$t('admin.baixaMemberNotice')}}</p>
      <p class="notice">*{{$t('admin.limitSendingMessagesNotice')}}</p>
      </section>

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="add" color="primary" to="/login" />
      </q-page-sticky>
      <!-- send message -->
      <send-message :prompt="openSendMessage" @cancel="messageCancel" @send="sendMessage($event)"></send-message>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { cleanObject } from 'src/utilities/cleanObject'
import { AdminService } from 'src/services/admin'
import { formatDate } from 'src/utilities/formatDate'
import { Member } from 'src/models/Member'
import { useI18n } from 'vue-i18n'
import SendMessage from 'src/components/SendMessage.vue'
import { useStore } from 'src/services/store'
import { useQuasar } from 'quasar'
import { exportToSpreadsheet } from 'src/utilities/exportExcel'

export default {
  name: 'AdminMembers',
  emits: ['row-click'],
  components: { SendMessage },
  setup () {
    const i18n = useI18n()
    const router = useRouter()
    const adminService = new AdminService()
    const store = useStore()
    const member = computed(() => store.state.user.member)
    const $q = useQuasar()

    // Data
    const members = ref<Member[]>([])
    const filter = ref<string | null>(null)
    const inactive = ref(false)
    const pagination = ref({
      sortBy: 'createdAt',
      descending: true,
      page: 1,
      rowsPerPage: 5,
      rowsNumber: 10
    })
    const selected = ref([])
    const openSendMessage = ref(false)
    const sendingMessage = ref(false)
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
      },
      {
        name: 'inactive',
        required: true,
        label: '',
        align: 'left',
        field: val => val?.family?.inactive,
        sortable: true
      }
    ])

    const getSelectedString = () => {
      return selected.value.length === 0 ? '' : `${selected.value.length} registre${selected.value.length > 1 ? 's' : ''} seleccionats de ${pagination.value.rowsNumber}`
    }

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
      orderBy: { ...orderBy, id: orderBy[pagination.value.sortBy] },
      filter: filter.value
    }
    const sanitizeVariables = cleanObject(variables)
    const { result, onResult, onError, loading, fetchMore, refetch } = adminService.getMembers(sanitizeVariables)
    const { mutate: sendMessageMutate } = adminService.addMessage()
    const { mutate: addMessageMembersMutate } = adminService.addMessageMembers()
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
        orderBy: { ...orderBy, id: orderBy[sortBy] },
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

    const toggleIsBaixa = async () => {
      inactive.value = !inactive.value
      await refetch({ ...variables, inactive: inactive.value })
      // getChildren()
    }

    const sendMessage = async ($event) => {
      sendingMessage.value = true
      const variables = {
        message: { ...$event }
      }
      await sendMessageMutate(variables)
        .then(async res => {
          const messageId = res.data.insert_messages_one.id
          const objects = []
          for (const member of selected.value) {
            objects.push({ memberId: member.id, messageId })
          }
          await addMessageMembersMutate({ objects })
            .then(() => {
              sendingMessage.value = false
              openSendMessage.value = false
            })
            .then(async () => {
              await store.dispatch('user/setMember', member.value.id)
              $q.notify({
                message: i18n.t('contact.messageSent')
              })
            })
            .catch((err) => {
              console.error(err)
              sendingMessage.value = false
              openSendMessage.value = false
            })
        })
        .catch((err) => {
          console.error(err)
          sendingMessage.value = false
          openSendMessage.value = false
        })
    }

    const messageCancel = () => {
      openSendMessage.value = false
    }

    const exportToExcel = () => {
      const data = [
        ['Id', 'Alta', 'Cognoms', 'Nom', 'Email', 'Família', 'Baixa']
      ]
      members.value.forEach(c => {
        data.push([
          `${c.id}`,
          `${c.createdAt}`,
          c.lastName,
          c.firstName,
          c.email,
          `${c.familyId}`,
          c.inactive ? 'Sí' : 'No'

        ])
      })

      exportToSpreadsheet(data, 'Usuaris')
    }

    // Error management

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onError(async () => {
      await router.push('/')
    })

    return {
      members,
      getSelectedString,
      selected,
      pagination,
      columns,
      loading,
      filter,
      onRowClick,
      onRequest,
      sendMessage,
      openSendMessage,
      sendingMessage,
      messageCancel,
      toggleIsBaixa,
      inactive,
      exportToExcel
    }
  }

}
</script>

<style>
.notice {
  margin-top: 1rem;
  opacity: 0.5;
  font-size: small;
}
</style>
