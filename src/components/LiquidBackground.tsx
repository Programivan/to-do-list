import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialYouPalette } from '../constants/theme';

interface LiquidBackgroundProps {
  theme: MaterialYouPalette;
}

const { width, height } = Dimensions.get('window');

export const LiquidBackground: React.FC<LiquidBackgroundProps> = ({ theme }) => {
  const [pulse1] = useState(() => new Animated.Value(1));
  const [pulse2] = useState(() => new Animated.Value(0.9));
  const [pulse3] = useState(() => new Animated.Value(1.05));

  useEffect(() => {
    const anim1 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse1, {
          toValue: 1.15,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse1, {
          toValue: 0.95,
          duration: 4500,
          useNativeDriver: true,
        }),
      ])
    );

    const anim2 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse2, {
          toValue: 1.2,
          duration: 5500,
          useNativeDriver: true,
        }),
        Animated.timing(pulse2, {
          toValue: 0.88,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    );

    const anim3 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse3, {
          toValue: 0.9,
          duration: 4800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse3, {
          toValue: 1.12,
          duration: 4200,
          useNativeDriver: true,
        }),
      ])
    );

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [pulse1, pulse2, pulse3]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Deep black canvas */}
      <View style={styles.baseCanvas} />

      {/* Ambient Liquid Blob 1 (Top-Right) */}
      <Animated.View
        style={[
          styles.blob1,
          {
            transform: [{ scale: pulse1 }],
          },
        ]}
      >
        <LinearGradient
          colors={[theme.ambientBlob1, 'transparent']}
          style={styles.gradientFill}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Ambient Liquid Blob 2 (Mid-Left) */}
      <Animated.View
        style={[
          styles.blob2,
          {
            transform: [{ scale: pulse2 }],
          },
        ]}
      >
        <LinearGradient
          colors={[theme.ambientBlob2, 'transparent']}
          style={styles.gradientFill}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Ambient Liquid Blob 3 (Bottom-Right) */}
      <Animated.View
        style={[
          styles.blob3,
          {
            transform: [{ scale: pulse3 }],
          },
        ]}
      >
        <LinearGradient
          colors={[theme.ambientBlob3, 'transparent']}
          style={styles.gradientFill}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Subtle vignette darkening towards bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(6, 7, 10, 0.45)', 'rgba(6, 7, 10, 0.85)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  baseCanvas: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#08090C',
  },
  blob1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    overflow: 'hidden',
  },
  blob2: {
    position: 'absolute',
    top: height * 0.35,
    left: -100,
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: (width * 0.85) / 2,
    overflow: 'hidden',
  },
  blob3: {
    position: 'absolute',
    bottom: -80,
    right: -40,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    overflow: 'hidden',
  },
  gradientFill: {
    flex: 1,
  },
});
