import React, { useMemo } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

type GlitterBackgroundProps = {
  starCount?: number;
  size?: number;
  color?: string;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function createAnimatedStar(delayMs: number) {
  const scale = new Animated.Value(1);
  const opacity = new Animated.Value(0.6);

  // Random cycle each loop to create a non-uniform, natural glitter pattern
  const runCycle = () => {
    const fadeOutMs = 200 + Math.floor(Math.random() * 700); // 200-900ms
    const fadeInMs = 200 + Math.floor(Math.random() * 700);  // 200-900ms
    const hold1Ms = Math.floor(Math.random() * 600);         // 0-600ms
    const hold2Ms = Math.floor(Math.random() * 600);         // 0-600ms

    Animated.sequence([
      Animated.delay(delayMs),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.4,
          duration: fadeOutMs,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: fadeOutMs,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(hold1Ms),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: fadeInMs,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: fadeInMs,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(hold2Ms),
    ]).start(({ finished }) => {
      if (finished) runCycle();
    });
  };

  runCycle();
  return { scale, opacity };
}

export function GlitterBackground({ starCount = 40, size = 10, color = '#22c55e' }: GlitterBackgroundProps) {
  // Create random positions and independent animations once
  const stars = useMemo(() => {
    const items: Array<{ left: number; top: number; anim: { scale: Animated.Value; opacity: Animated.Value } }> = [];

    const randOutsideCenter = () => {
      let r = 0.5;
      while (r > 0.4 && r < 0.6) {
        r = Math.random();
      }
      return r;
    };

    for (let i = 0; i < starCount; i++) {
      const delayMs = Math.floor(Math.random() * 1000);
      items.push({
        left: randOutsideCenter() * screenWidth,
        top: randOutsideCenter() * screenHeight,
        anim: createAnimatedStar(delayMs),
      });
    }
    return items;
  }, [starCount]);

  return (
    <View pointerEvents="none" style={styles.container}>
      {stars.map((star, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.star,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              left: star.left,
              top: star.top,
              opacity: star.anim.opacity,
              transform: [{ scale: star.anim.scale }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: -1,
  },
  star: {
    position: 'absolute',
  },
});

export default GlitterBackground;


