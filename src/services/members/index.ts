// import { useQuery, useResult } from '@vue/apollo-composable'
import getMembers from './queries/getMembers.gql'
import getMemberById from './queries/getMemberById.gql'
import {
  MemberData,
  // MembersData,
  MemberVars
  // MembersVars
} from 'src/models/Member'
// import { apolloClient } from 'src/boot/apollo'
import { useQuery } from '@urql/vue'

export class MembersService {
  getAll = (offset: number, limit: number) => {
    /* const { result, loading, error, fetchMore } = useQuery<MembersData, MembersVars>(getMembers, { offset, limit })
    const members = useResult(result, null, data => data.members)
    return { members, loading, error, fetchMore } */
    const result = useQuery({
      query: getMembers,
      variables: { offset, limit }
    })
    return result
  }

  getById = (id: string) => {
    /* const { result, loading, error } = useQuery<MemberData, MemberVars>(
      getMemberById,
      { id }
    )
    const member = useResult(result, null, data => data.members_by_pk)
    return { member, loading, error } */
    const result = useQuery<MemberData, MemberVars>({
      query: getMemberById,
      variables: { id }
    })
    console.log('result', result)
    return result
  }

  /* clearCache = async () => {
    await apolloClient.clearStore()
  } */
}
