import { Colors } from '@/constants/Colors';
import { useUserProfile } from '@/hooks/useUserProfile';
import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, InputAccessoryView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);

  const addThread = useMutation(api.messages.addThreadMessage);

  const handleSumbit = async () => {
    addThread({
      threadId,
      content: threadContent,
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
        onPress: ()=>router.dismiss(),
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

  const selectImage = (type: 'library' | 'camera' ) => {
    console.log(type);
    
  }

  return (
    <View>
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

          <View style={styles.iconRow}>
            <TouchableOpacity style={styles.iconButton} onPress={()=>selectImage('library')}>
              <Ionicons name="images-outline" size={24} color={Colors.border} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={()=>selectImage('camera')}>
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

        <TouchableOpacity style={[styles.cancelButton,{
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
    </View>
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
})