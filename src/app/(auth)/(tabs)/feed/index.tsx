import * as Sentry from '@sentry/react-native';
import { Button, StyleSheet, Text, View } from 'react-native';

const Page = () => {
  const testError = () => {
    try {
      throw new Error('test error');
    }catch (error) {
      const sentryID = Sentry.captureMessage('We have a problem');
      // console.log('Sebtry ID', sentryID);

      const userFeedback = {
        associatedEventId: sentryID,
        name: 'John Doe',
        email: 'john.doe@example.com',
        message: 'This was not so cool'
      }

      Sentry.captureFeedback(userFeedback);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>This is feed</Text>
      <Button title='Try!' onPress={testError}/>
    </View>
  )
}

export default Page

const styles = StyleSheet.create({})