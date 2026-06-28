import Profile from '@/components/Profile';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Id } from '../../../../../../convex/_generated/dataModel';

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <Profile userId={id as Id<'users'>} showBackButton />
}

export default Page

const styles = StyleSheet.create({})