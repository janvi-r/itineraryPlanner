

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

const SwipeCard = ({ data, onSwipeRight, onSwipeLeft }) => {
  const position = useRef(new Animated.ValueXY()).current;

  const validImages = data.images ? data.images.filter(url => url && url !== 'N/A') : [];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (validImages.length && currentImageIndex < validImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
    else{
      setCurrentImageIndex(0)
     }
  };

  const prevImage = () => {
    if (validImages.length && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else{
      setCurrentImageIndex(validImages.length-1)
    }
  };

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  const cardStyle = {
    transform: [...position.getTranslateTransform(), { rotate }],
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: position.y._value,
        });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        position.flattenOffset();
        if (position.x._value > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (position.x._value < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction) => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      if (direction === 'right') onSwipeRight(data);
      else onSwipeLeft(data);
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  return (
    <Animated.View style={[styles.card, cardStyle]} {...panResponder.panHandlers}>
      {validImages.length > 0 ? (
        <>
          <TouchableOpacity onPress={nextImage} onLongPress={prevImage}>
            <Image
              source={{ uri: validImages[currentImageIndex] }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <Text style={styles.counterText}>
            {`${currentImageIndex + 1} / ${validImages.length}`}
          </Text>
        </>
      ) : (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>No image available</Text>
        </View>
      )}
      <Text style={styles.text}>{data.name || data.text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: 500,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  image: {
    width: 400,  // Can also use '100%' if you want full width
    height: 400,
    resizeMode: 'contain',
  },
  counterText: {
    color: '#666',
    marginTop: 5,
  },
  text: {
    fontSize: 24,
    marginTop: 15,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  noImageContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  noImageText: {
    fontSize: 16,
    color: '#999',
  },
});

export default SwipeCard;
