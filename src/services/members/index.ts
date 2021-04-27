import { useQuery, useResult, useMutation } from '@vue/apollo-composable'
import getMembers from './queries/getMembers.gql'
import getMemberById from './queries/getMemberById.gql'
import updateMember from 'src/services/members/queries/updateMember.gql'
import updateFamily from 'src/services/members/queries/updateFamily.gql'
import updateChildren from 'src/services/members/queries/updateChildren.gql'
import findFamily from 'src/services/members/queries/findFamily.gql'

import { MemberData, MembersData, MemberVars, MembersVars } from 'src/models/Member'
import { apolloClient } from 'src/boot/apollo'
import { FamilyData, FamilyVars, FindFamilyVars, FamiliesData } from 'src/models/Family'
import { ChildrenData, ChildrenVars } from 'src/models/Child'

export class MembersService {
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
    const response = useQuery<FamiliesData, FindFamilyVars>(
      findFamily,
      { name: searchName }
    )
    const families = useResult(response.result, null, data => data.families)
    return { families, ...response }
  }

  clearCache = async () => {
    await apolloClient.clearStore()
  }
}
