import { useQuery, useResult } from '@vue/apollo-composable'
// import gql from 'graphql-tag'
import getMembers from './queries/getMembers.gql'
import getMemberById from './queries/getMemberById.gql'
import { MemberData, MembersData, MemberVars, MembersVars } from '@/models/Member'
import { apolloClient } from 'src/boot/apollo'

export class MembersService {
  getAll = (offset: number, limit: number) => {
    const { result, loading, error, fetchMore } = useQuery<MembersData, MembersVars>(getMembers, { offset, limit })
    const members = useResult(result, null, data => data.members)
    return { members, loading, error, fetchMore }
  }

  getById = (id: string) => {
    const { result, loading, error } = useQuery<MemberData, MemberVars>(
      getMemberById,
      { id }
    )
    const member = useResult(result, null, data => data.members_by_pk)

    return { member, loading, error }
  }

  clearCache = async () => {
    await apolloClient.clearStore()
  }
}
