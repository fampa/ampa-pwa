import getMembers from 'src/services/members/queries/getMembers.gql'
import getMemberById from 'src/services/members/queries/getMemberById.gql'
import updateMember from 'src/services/members/queries/updateMember.gql'
import {
  // MemberData,
  MembersData,
  // MemberVars,
  MembersVars
} from 'src/models/Member'
import { useQuery, useMutation } from '@urql/vue'
import { client } from 'src/boot/urql'

export class MembersService {
  getAll = (offset: number, limit: number) => {
    const result = useQuery<MembersData, MembersVars>({
      query: getMembers,
      variables: { offset, limit }
    })
    return result
  }

  getById = async (id: string) => {
    // const result = useQuery<MemberData, MemberVars>({
    //   query: getMemberById,
    //   variables: { id }
    // })
    const result = await client.query(getMemberById, { id }).toPromise()
    // console.log('result', result)
    return result
  }

  updateMember = () => {
    const { executeMutation } = useMutation(updateMember)
    return { executeMutation }
  }
}
