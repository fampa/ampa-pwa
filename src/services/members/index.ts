import { useQuery, useResult, useMutation } from '@vue/apollo-composable'
import getMembers from './queries/getMembers.gql'
import getMemberById from './queries/getMemberById.gql'
import updateMember from 'src/services/members/queries/updateMember.gql'
import upsertFamily from 'src/services/members/queries/upsertFamily.gql'
import updateChildren from 'src/services/members/queries/updateChildren.gql'
import searchFamilies from 'src/services/members/queries/searchFamilies.gql'
import updateFamily from 'src/services/members/queries/updateFamily.gql'

import { MemberData, MembersData, MemberVars, MembersVars, Member } from 'src/models/Member'
import { apolloClient } from 'src/boot/apollo'
import { FamilyData, FamilyVars, FamilyUpdateVars, FamilySearchData } from 'src/models/Family'
import { ChildrenData, ChildrenVars } from 'src/models/Child'
import axios from 'axios'

export class MembersService {
  private axiosEndpoint = process.env.DEV ? `http://localhost:5001/${process.env.FIREBASE_PROJECT_ID || ''}/europe-west1/api` : `https://europe-west1-${process.env.FIREBASE_PROJECT_ID || ''}.cloudfunctions.net/api`

  getAll = (offset: number, limit: number) => {
    const response = useQuery<MembersData, MembersVars>(getMembers, { offset, limit })
    const members = useResult(response.result, null, data => data.members)
    return { members, ...response }
  }

  getById = (id: string) => {
    const response = useQuery<MemberData, MemberVars>(
      getMemberById,
      { id }
    )
    const member = useResult(response.result, null, data => data.members_by_pk)
    return { member, ...response }
  }

  updateMember = () => {
    const response = useMutation<MemberData, MemberVars>(
      updateMember
    )
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

  clearCache = async () => {
    await apolloClient.clearStore()
  }
}
