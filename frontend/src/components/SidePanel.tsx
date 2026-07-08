import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { logout, User } from '../services/auth';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PANEL_WIDTH = SCREEN_WIDTH * 0.85;

interface Props {
  user: User | null;
  onLogout: () => void;
  onClose: () => void;
}

export default function SidePanel({ user, onLogout, onClose }: Props) {
  const slideAnim = useRef(new Animated.Value(PANEL_WIDTH)).current;

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  }, []);

  function close() {
    Animated.timing(slideAnim, { toValue: PANEL_WIDTH, duration: 220, useNativeDriver: true }).start(onClose);
  }

  async function handleLogout() {
    await logout();
    onLogout();
  }

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={close} activeOpacity={1} />
      <Animated.View style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>{user?.name ?? 'Settings'}</Text>
            <TouchableOpacity onPress={close}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  panel: {
    width: PANEL_WIDTH,
    backgroundColor: '#111122',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  panelTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  closeText: { color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  content: { paddingHorizontal: 20, paddingTop: 24 },
  logoutButton: {
    paddingVertical: 13, alignItems: 'center',
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,59,48,0.4)',
  },
  logoutText: { color: '#FF3B30', fontSize: 14, fontWeight: '600' },
});
