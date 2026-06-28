import Thread from '@/components/Thread';
import { useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { api } from '../../../../../convex/_generated/api';
import { Doc, Id } from '../../../../../convex/_generated/dataModel';

const Pages = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const thread = useQuery(api.messages.getThreadById, {messageId: id as Id<'messages'>})
  return (
    <View>
      <ScrollView>
        {thread ? <Thread thread={thread as Doc<'messages'> & {creator: Doc<'users'>}} /> : <ActivityIndicator />}
      </ScrollView>
    </View>
  )
}

export default Pages

const styles = StyleSheet.create({})