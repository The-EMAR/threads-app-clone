import { Colors } from '@/constants/Colors';
import { useMutation } from 'convex/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

const Page = () => {
  const { biostring, linkstring, userId, imageUrl } = useLocalSearchParams<{
    biostring: string;
    linkstring: string;
    userId: string;
    imageUrl: string;
  }>();
  
  const [bio, setBio] = useState(biostring);
  const [link, setLink] = useState(linkstring);
  const updateUser = useMutation(api.users.updateUser);

  const router = useRouter();

  const onDone = async() => {
    await updateUser({
      _id: userId as Id<"users">,
      bio,
      websiteUrl: link,
    })

    router.dismiss();
  }

  return (
    <View>
      <Stack.Screen 
        options={{
          headerRight: ()=>(
            <TouchableOpacity onPress={()=>onDone()}>
              <Text>Done</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <Image source={{ uri: imageUrl }} style={styles.image} />

      <View style={styles.section}>
        <Text style={styles.label}>Bio</Text>
        <TextInput 
          value={bio}
          onChangeText={setBio}
          style={styles.bioInput}
          multiline
          numberOfLines={4}
          textAlignVertical='top'
          placeholder='Tell us about yourself'
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Link</Text>
        <TextInput 
          value={link}
          onChangeText={setLink}
          placeholder='https://www.example.com'
          autoCapitalize='none'
        />
      </View>
    </View>
  )
}

export default Page

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    margin: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 100,
    alignSelf: 'center'
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bioInput: {
    fontSize: 14,
    fontWeight: '500',
    height: 100,
  }
})