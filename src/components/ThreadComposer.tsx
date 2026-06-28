import { Colors } from '@/constants/Colors';
import { useUserProfile } from '@/hooks/useUserProfile';
import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { ImagePickerAsset, ImagePickerOptions } from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, InputAccessoryView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

type ThreadComposerProps = {
  isPreview?: boolean;
  isReply?: boolean;
  threadId?: Id<'messages'>
}

const ThreadComposer = ({ isPreview, isReply, threadId }: ThreadComposerProps) => {
  const router = useRouter();
  const { userProfile } = useUserProfile();
  const InputAccessoryViewID = 'uniqueId';

  const [threadContent, setThreadContent] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<ImagePickerAsset[]>([]);

  const addThread = useMutation(api.messages.addThreadMessage);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);

  const handleSumbit = async () => {
    const mediaIds = await Promise.all(mediaFiles.map(uploadMediaFile));

    addThread({
      threadId,
      content: threadContent,
      mediaFiles: mediaIds,
    });
    setThreadContent('');
    setMediaFiles([]);
    router.dismiss();
  };

  const removeThread = () => {
    setThreadContent('');
    setMediaFiles([]);
  }

  const handleCancel = async () => {
    setThreadContent(''),
      Alert.alert('Discard thread?', '', [
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.dismiss(),
        },
        {
          text: 'Save draft',
          style: 'cancel',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        }
      ])
  }

  const selectImage = async (type: 'library' | 'camera') => {
    const options: ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
    }

    let result;

    if (result === 'library') {
      result = await ImagePicker.launchImageLibraryAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled) {
      setMediaFiles([result.assets[0], ...mediaFiles]);
    }
  }

  const uploadMediaFile = async (image: ImagePickerAsset) => {
    const uploadUrl = await generateUploadUrl();

    if (!image?.uri) return null;

    const imageFile = new File(image.uri);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: imageFile,
      headers: {
        'Content-Type': image.mimeType || 'image/jpeg',
      },
    });

    const { storageId } = await response.json();

    return storageId;
  }

  return (
    <TouchableOpacity onPress={() => {
      router.push('/(auth)/(modal)/create')
    }}
    
    style={
      isPreview && {
        inset: 0,
        zIndex: 1000,
        height: 100,
        pointerEvents: 'box-only'
      }
    }
    >
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel}>
              <Text>Cancel</Text>
            </TouchableOpacity>
          )
        }}
      />

      <View style={styles.topRow}>
        {userProfile && (
          <Image source={{ uri: userProfile?.imageUrl || '' }} style={styles.avatar} />
        )}

        <View style={styles.centerContainer}>
          <Text style={styles.name}>{userProfile?.first_name} {userProfile?.last_name}</Text>
          <TextInput
            style={styles.input}
            placeholder={isReply ? 'Reply to thread' : `What's new`}
            value={threadContent}
            onChangeText={setThreadContent}
            multiline
            autoFocus={!isPreview}
            inputAccessoryViewID={InputAccessoryViewID}
          />

          {mediaFiles.length > 0 && (
            <ScrollView horizontal>
              {mediaFiles.map((file, index) => (
                <View style={styles.mediaContainer} key={index}>
                  <Image source={{ uri: file.uri }} style={styles.mediaImage} />
                  <TouchableOpacity
                    style={styles.deleteIconContainer}
                    onPress={() => {
                      setMediaFiles(mediaFiles.filter((_, i) => i !== index))
                    }}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.iconRow}>
            <TouchableOpacity style={styles.iconButton} onPress={() => selectImage('library')}>
              <Ionicons name="images-outline" size={24} color={Colors.border} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => selectImage('camera')}>
              <Ionicons name="camera-outline" size={24} color={Colors.border} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialIcons name="gif" size={24} color={Colors.border} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="mic-outline" size={24} color={Colors.border} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <FontAwesome6 name="hashtag" size={24} color={Colors.border} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="stats-chart-outline" size={24} color={Colors.border} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.cancelButton, {
          opacity: isPreview ? 0 : 1,
        }]} onPress={removeThread}>
          <Ionicons name="close" size={24} color={Colors.border} />
        </TouchableOpacity>
      </View>

      <InputAccessoryView nativeID={InputAccessoryViewID}>
        <View style={styles.keyboardAccessory}>
          <Text style={styles.keyboardAccessoryText}>
            {isReply ? 'Everyone can reply and quote' : 'Profiles that you follow can reply and quote'}
          </Text>

          <TouchableOpacity onPress={handleSumbit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </InputAccessoryView>
    </TouchableOpacity>
  )
}

export default ThreadComposer

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignSelf: 'flex-start',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
  },
  input: {
    fontSize: 16,
    maxHeight: 100,
  },
  iconRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  iconButton: {
    marginRight: 16,
  },
  cancelButton: {
    marginLeft: 12,
    alignSelf: 'flex-start',
  },
  keyboardAccessory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    paddingLeft: 64,
  },
  keyboardAccessoryText: {
    flex: 1,
    color: Colors.border,
  },
  submitButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mediaContainer: {
    marginRight: 10,
    marginLeft: 10,
  },
  mediaImage: {
    width: 100,
    height: 200,
    borderRadius: 6,
    marginRight: 10,
    marginTop: 10,
  },
  deleteIconContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 12,
  }
})