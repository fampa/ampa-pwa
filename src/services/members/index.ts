import { useQuery, useResult, useMutation } from '@vue/apollo-composable'
import getMembers from './queries/getMembers.gql'
import getMemberById from './queries/getMemberById.gql'
import updateMember from 'src/services/members/queries/updateMember.gql'
import { MemberData, MembersData, MemberVars, MembersVars } from 'src/models/Member'
import { apolloClient } from 'src/boot/apollo'

export class MembersService {
  getAll = (offset: number, limit: number) => {
    const { result, loading, error, fetchMore } = useQuery<MembersData, MembersVars>(getMembers, { offset, limit })
    const members = useResult(result, null, data => data.members)
    return { members, loading, error, fetchMore }
  }

  getById = (id: string) => {
    const { result, loading, error, onResult } = useQuery<MemberData, MemberVars>(
      getMemberById,
      { id }
    )
    const member = useResult(result, null, data => data.members_by_pk)
    return { member, loading, error, onResult }
  }

  updateMember = () => {
    const { mutate, loading, error } = useMutation<MemberData, MemberVars>(
      updateMember
    )
    return { mutate, loading, error }
  }

  clearCache = async () => {
    await apolloClient.clearStore()
  }
}
