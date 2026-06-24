import { Colors } from '@/constants/Colors';
import { useMutation } from 'convex/react';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { ImagePickerAsset } from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { fetch } from 'expo/fetch';
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
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);

  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<ImagePickerAsset | null>();

  const onDone = async () => {
    let storageId = null;

    if (selectedImage) {
      storageId = await updateProfilePicture();
    }
    
    const toUpdate: any = {
      _id: userId as Id<"users">,
      bio,
      websiteUrl: link,
    }

    if (storageId) {
      toUpdate.imageUrl = storageId;
    }

    await updateUser(toUpdate);

    router.dismiss();
  }

  const updateProfilePicture = async () => {
    const uploadUrl = await generateUploadUrl();

    if (!selectedImage?.uri) return null;

    const imageFile = new File(selectedImage.uri);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: imageFile,
      headers: {
        'Content-Type': selectedImage.mimeType || 'image/jpeg',
      },
    });
    
    const { storageId } = await response.json();
    
    return storageId;
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }      
  }

  return (
    <View>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={() => onDone()}>
              <Text>Done</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <TouchableOpacity onPress={() => pickImage()}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage.uri }} style={styles.image} />
        ) : (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        )}
      </TouchableOpacity>

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