import Thread from '@/components/Thread';
import ThreadComposer from '@/components/ThreadComposer';
import { Colors } from '@/constants/Colors';
import { usePaginatedQuery } from 'convex/react';
import { Link, useIsFocused, useNavigation } from 'expo-router';
import { useBottomTabBarHeight } from 'expo-router/build/react-navigation/bottom-tabs';
import { useState } from 'react';
import { Image, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { runOnJS } from 'react-native-worklets';
import { api } from '../../../../../convex/_generated/api';
import { Doc } from '../../../../../convex/_generated/dataModel';

const Page = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { top } = useSafeAreaInsets();

  // Animation
  const navigation = useNavigation();
  const scrollOffset = useSharedValue(0);
  const tabBarHeight = useBottomTabBarHeight();
  const isFocused = useIsFocused();

  const updateTabBar = () => {
    let newMarginBottom = 0;
    if (scrollOffset.value >= 0 && scrollOffset.value <= tabBarHeight) {
      newMarginBottom = -scrollOffset.value;
    } else if (scrollOffset.value > tabBarHeight) {
      newMarginBottom = -tabBarHeight;
    }

    navigation.getParent()?.setOptions({
      tabBarStyle: {
        marginBottom: newMarginBottom,
      }
    })
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (isFocused) {
        scrollOffset.value = event.contentOffset.y;
        runOnJS(updateTabBar)();
      }
    }
  });


  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.getThreads,
    {},
    {
      initialNumItems: 5,
    }
  )

  const onLoadMore = () => {
    loadMore(5);
  }

  const onReresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false)
    }, 2000);
  }

  return (
    <Animated.FlatList
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      data={results}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
       <Link href={`/(auth)/(tabs)/feed/${item._id}`} asChild>
        <TouchableOpacity>
          <Thread thread={item as Doc<'messages'> & { creator: Doc<'users'> }} />
        </TouchableOpacity>
       </Link>
      )}
      keyExtractor={(item) => item._id}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onReresh} />}
      ItemSeparatorComponent={() => (
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: Colors.border }} />
      )}
      contentContainerStyle={{ paddingVertical: top }}
      ListHeaderComponent={
        <View style={{ paddingBottom: 16 }}>
          <Image
            source={require('@/assets/images/threads-logo-black.png')}
            style={{ width: 40, height: 40, alignSelf: 'center' }}
          />
          <ThreadComposer isPreview />
        </View>
      }
    />
  )
}

export default Page

const styles = StyleSheet.create({})