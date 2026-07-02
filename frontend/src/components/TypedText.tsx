import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

interface Props {
  text: string;
  speed?: number;
  style?: object;
}

export default function TypedText({ text, speed = 28, style }: Props) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <Text style={[styles.text, style]}>{displayed}</Text>;
}

const styles = StyleSheet.create({
  text: { fontSize: 14, lineHeight: 22, color: 'rgba(255,200,100,0.85)' },
});
