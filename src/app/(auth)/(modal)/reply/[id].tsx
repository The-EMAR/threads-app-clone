import Thread from '@/components/Thread';
import { useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { api } from '../../../../../convex/_generated/api';
import { Doc, Id } from '../../../../../convex/_generated/dataModel';
import ThreadComposer from '../create';

const Page = () => {
  const { id } = useLocalSearchParams<{id: string}>();
  const thread = useQuery(api.messages.getThreadById, {messageId: id as Id<'messages' >})
  
  return (
    <View>
      {thread ? <Thread thread={thread as Doc<'messages'> & {creator: Doc<'users'>}} /> : <ActivityIndicator />}
      <ThreadComposer isReply threadId={id as Id<'messages'>} />
    </View>
  )
}

export default Page

const styles = StyleSheet.create({})