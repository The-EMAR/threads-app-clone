import { Colors } from '@/constants/Colors';
import { useSSO } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const { startSSOFlow } = useSSO();

  const handleFacebookLogin = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_facebook',
      });
      console.log('handleFacebookLogin ~ createdSessionId', createdSessionId);

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('Facebook login error', err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
      });
      console.log('handleGoogleLogin ~ createdSessionId', createdSessionId);
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('Google login error', err);
    }
  };

  return (
    <View
      style={styles.container}
    >
      <Image style={styles.loginImage} source={require('@/assets/images/login.png')} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>How would you like to use Threads?</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={handleFacebookLogin}>
            <View style={styles.loginButtonContent}>
              <Image style={styles.loginButtonIcon} source={require('@/assets/images/instagram_icon.webp')} />
              <Text style={styles.loginButtonText}>Continue with Instagram</Text>
              <Ionicons name="chevron-forward" size={24} color={Colors.border} />
            </View>
            <Text style={styles.loginButtonSubtitle}>
              Login in or create a Threads profile with your Instagram account. With a profile, you can
              post, interract and get personalised recommendations.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleGoogleLogin}>
            <View style={styles.loginButtonContent}>
              <Text style={styles.loginButtonText}>Continue with Google</Text>
              <Ionicons name="chevron-forward" size={24} color={Colors.border} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton}>
            <View style={styles.loginButtonContent}>
              <Text style={styles.loginButtonText}>Use without a profile</Text>
              <Ionicons name="chevron-forward" size={24} color={Colors.border} />
            </View>
            <Text style={styles.loginButtonSubtitle}>
              You can browse Threads without a profile, but wont't be able to post, interract or
              get personalised recommendations.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.switchAccountButtonText}>Switch account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loginImage: {
    width: '100%',
    height: 350,
    resizeMode: 'cover',
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 17,
  },
  loginButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loginButtonIcon: {
    width: 50,
    height: 50,
  },
  loginButtonText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    flex: 1,
  },
  loginButtonSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    marginTop: 5,
    color: Colors.border,
  },
  switchAccountButtonText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    alignSelf: 'center',
    color: Colors.border,
  }
});
