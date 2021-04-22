import getMembers from 'src/services/members/queries/getMembers.gql'
import getMemberById from 'src/services/members/queries/getMemberById.gql'
import updateMember from 'src/services/members/queries/updateMember.gql'
import {
  MemberData,
  MembersData,
  MemberVars,
  MembersVars,
  Member
} from 'src/models/Member'
import { useQuery, useMutation } from '@urql/vue'

export class MembersService {
  getAll = (offset: number, limit: number) => {
    const result = useQuery<MembersData, MembersVars>({
      query: getMembers,
      variables: { offset, limit }
    })
    return result
  }

  getById = (id: string) => {
    const result = useQuery<MemberData, MemberVars>({
      query: getMemberById,
      variables: { id }
    })
    console.log('result', result)
    return result
  }

  updateMember = (member: Member) => {
    const variables = { ...member }
    const { executeMutation } = useMutation(updateMember)
    const result = executeMutation(variables)
    console.log('result', result)
    return result
  }
}
