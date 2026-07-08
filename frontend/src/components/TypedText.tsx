import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface Props {
  text: string;
  style?: object;
}

export default function TypedText({ text, style }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [text]);

  return (
    <Animated.Text style={[styles.text, style, { opacity }]}>
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 14, lineHeight: 22, color: 'rgba(255,200,100,0.85)' },
});
