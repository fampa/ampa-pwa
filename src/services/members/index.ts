/* eslint-disable camelcase */
import { useQuery, useResult, useMutation } from '@vue/apollo-composable'
import getMembers from './queries/getMembers.gql'
import getMemberById from './queries/getMemberById.gql'
import updateMember from 'src/services/members/queries/updateMember.gql'
import upsertFamily from 'src/services/members/queries/upsertFamily.gql'
import updateChildren from 'src/services/members/queries/updateChildren.gql'
import searchFamilies from 'src/services/members/queries/searchFamilies.gql'
import updateFamily from 'src/services/members/queries/updateFamily.gql'
import upsertMembersToken from './queries/upsertMembersToken.gql'
import deleteMembersToken from './queries/deleteMembersToken.gql'
import deleteChild from './queries/deleteChild.gql'
import firebase from 'firebase/app'
import 'firebase/auth'

import { MemberData, MembersData, MemberVars, MembersVars, Member, UpdateMemberData } from 'src/models/Member'
import { apolloClient } from 'src/boot/apollo'
import { FamilyData, FamilyVars, FamilyUpdateVars, FamilySearchData } from 'src/models/Family'
import { ChildrenData, ChildrenVars } from 'src/models/Child'
import axios from 'axios'

export class MembersService {
  public axiosEndpoint = process.env.DEV ? `http://localhost:5001/${process.env.FIREBASE_PROJECT_ID || ''}/us-central1/api` : `https://us-central1-${process.env.FIREBASE_PROJECT_ID || ''}.cloudfunctions.net/api`

  getAll = (offset: number, limit: number) => {
    const response = useQuery<MembersData, MembersVars>(getMembers, { offset, limit })
    const members = useResult(response.result, null, data => data.members)
    return { members, ...response }
  }

  getById = (id: string) => {
    if (!id) return
    const response = useQuery<MemberData, MemberVars>(
      getMemberById,
      { id }
    )
    const member = useResult(response.result, null, data => data.members_by_pk)
    return { member, ...response }
  }

  updateMember = () => {
    const response = useMutation<UpdateMemberData, MemberVars>(
      updateMember
    )
    return response
  }

  removeMember = async (id: string) => {
    if (!id) return
    const data = { id }
    const token = await firebase.auth().currentUser.getIdToken()
    const endpoint = `${this.axiosEndpoint}/admin/remove-user/`
    const response = await axios
      .post(endpoint, data, { headers: { authorization: `Bearer ${token}` } })
    return response
  }

  upsertFamily = () => {
    const response = useMutation<FamilyData, FamilyVars>(
      upsertFamily
    )
    return response
  }

  updateFamily = () => {
    const response = useMutation<FamilyData, FamilyUpdateVars>(
      updateFamily
    )
    return response
  }

  updateChildren = () => {
    const response = useMutation<ChildrenData, ChildrenVars>(
      updateChildren
    )
    return response
  }

  requestFamilyJoin = async (familyId: number, member: Member) => {
    const data = { familyId, member }
    const endpoint = `${this.axiosEndpoint}/request/family-access/`
    const response = await axios
      .post(endpoint, data)
    return response
  }

  resolveFamilyJoin = async (familyId: number, member: Record<string, unknown>) => {
    const data = { familyId, member }
    const endpoint = `${this.axiosEndpoint}/resolve/family-access/`
    const response = await axios
      .post(endpoint, data)
    return response
  }

  contact = async (messageObj: Record<string, unknown>) => {
    const endpoint = `${this.axiosEndpoint}/contact/`
    const response = await axios
      .post(endpoint, messageObj)
    return response
  }

  searchFamily = (name: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = useQuery<FamilySearchData, any>(
      searchFamilies,
      {
        name
      },
      {
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache',
        context: {
          headers: {
            'x-hasura-role': 'public'
          }
        }
      }
    )
    const families = useResult(response.result, null, data => data.search_families)
    return { families, ...response }
  }

  makeAdmin = async (member: Member) => {
    const token = await firebase.auth().currentUser.getIdToken()
    const data = { member }
    const endpoint = `${this.axiosEndpoint}/admin/change-claims/`
    const response = await axios
      .post(endpoint, data, { headers: { authorization: `Bearer ${token}` } })
    return response
  }

  upsertMembersToken = () => {
    const response = useMutation<{insert_members_tokens_one: { token: string }}, { memberId: string, token: string }>(
      upsertMembersToken
    )
    return response
  }

  deleteMembersToken = () => {
    const response = useMutation<{delete_members_tokens_by_pk: { token: string }}, { memberId: string, token: string }>(
      deleteMembersToken
    )
    return response
  }

  deleteChild = () => {
    const response = useMutation<{delete_children_by_pk: { id: number }}, { id: number }>(
      deleteChild
    )
    return response
  }

  sendMandateMail = async (id: number, member: Member, language?: string) => {
    const data = { id, member, language }
    const endpoint = `${this.axiosEndpoint}/mandate/send/`
    const response = await axios
      .post(endpoint, data)
    return response
  }

  signMandate = async (id: number, member: Member, mandateSignatureCode?: string, language?: string) => {
    const data = { id, member, language, mandateSignatureCode }
    const endpoint = `${this.axiosEndpoint}/mandate/sign/`
    const response = await axios
      .post(endpoint, data)
    return response
  }

  clearCache = async () => {
    await apolloClient.clearStore()
  }
}
