import { useQuery } from 'convex/react'
import { StyleSheet, View } from 'react-native'
import { api } from '../../convex/_generated/api'
import { Doc, Id } from '../../convex/_generated/dataModel'
import Thread from './Thread'

type CommentsProps = {
  messageId: Id<'messages'>
}

const Comments = ({ messageId }: CommentsProps) => {
  const comments = useQuery(api.messages.getThreadByComments, {messageId: messageId as Id<'messages'>});

  return (
    <View>
      {comments?.map((comment)=>(
        <Thread key={comment._id} thread={comment as Doc<'messages'> & {creator: Doc<'users'>}} />
      ))}
    </View>
  )
}

export default Comments

const styles = StyleSheet.create({})