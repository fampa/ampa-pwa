import { useQuery, useResult, useMutation } from '@vue/apollo-composable'
import getMembers from './queries/getMembers.gql'
import getMemberById from './queries/getMemberById.gql'
import updateMember from 'src/services/members/queries/updateMember.gql'
import updateFamily from 'src/services/members/queries/updateFamily.gql'
import updateChildren from 'src/services/members/queries/updateChildren.gql'
import findFamily from 'src/services/members/queries/findFamily.gql'

import { MemberData, MembersData, MemberVars, MembersVars, Member } from 'src/models/Member'
import { apolloClient } from 'src/boot/apollo'
import { FamilyData, FamilyVars, FamiliesData } from 'src/models/Family'
import { ChildrenData, ChildrenVars } from 'src/models/Child'
import axios from 'axios'

export class MembersService {
  private axiosEndpoint = `https://europe-west1-${process.env.FIREBASE_PROJECT_ID || ''}.cloudfunctions.net/api`

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

  updateFamily = () => {
    const response = useMutation<FamilyData, FamilyVars>(
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

  findFamily = (name: string) => {
    const searchName = `%${name}%`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = useQuery<FamiliesData, any>(
      findFamily,
      {
        name: searchName
      },
      {
        context: {
          headers: {
            'x-hasura-role': 'public'
          }
        }
      }
    )
    const families = useResult(response.result, null, data => data.families)
    return { families, ...response }
  }

  requestFamilyJoin = async (familyId: number, member: Member) => {
    const data = { familyId, member }
    const endpoint = `${this.axiosEndpoint}/request/family-access/`
    const response = await axios
      .post(endpoint, data)
    return response
  }

  clearCache = async () => {
    await apolloClient.clearStore()
  }
}
