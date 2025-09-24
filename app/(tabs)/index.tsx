import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Image as ImageIcon, Sparkles, Leaf, Sun, Search, CheckSquare } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import GlitterBackground from '@/components/GlitterBackground';
import { useTheme } from '@/hooks/useTheme';

const { width } = Dimensions.get('window');

interface Analysis {
  id: string;
  imageData: string;
  result: string;
  timestamp: number;
  isFavorite?: boolean;
}

export default function HomeScreen() {
  const { colors, theme } = useTheme();
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRecentAnalyses();
  }, []);

  const loadRecentAnalyses = async () => {
    try {
      const stored = await AsyncStorage.getItem('plant_analyses');
      if (stored) {
        const analyses = JSON.parse(stored);
        setRecentAnalyses(analyses.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissões Necessárias',
        'Este app precisa de acesso à câmera e galeria para funcionar corretamente.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Corrected syntax
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    setIsLoading(false);

    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: '/analysis',
        params: { imageData: result.assets[0].base64 },
      });
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Corrected syntax
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    setIsLoading(false);

    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: '/analysis',
        params: { imageData: result.assets[0].base64 },
      });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={theme === 'dark' 
          ? ['#0f172a', '#1e293b', '#334155'] 
          : ['#f0fdf4', '#ecfdf5', '#f0f9ff']
        }
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <GlitterBackground starCount={50} size={8} color="#22c55e" />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Leaf size={32} color={colors.primary} />
                </View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>PlantCare</Text>
              </View>
            </View>

        <View style={styles.actionSection}>
          <LinearGradient
            colors={[colors.primary, '#16a34a']}
            style={[styles.mainButton, { shadowColor: colors.primary }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity
              style={styles.mainButtonTouchable}
              onPress={() => {
                Alert.alert(
                  'Escolha uma opção',
                  'Como você gostaria de adicionar a imagem?',
                  [
                    { text: 'Câmera', onPress: takePhoto },
                    { text: 'Galeria', onPress: pickImage },
                    { text: 'Cancelar', style: 'cancel' },
                  ]
                );
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="large" />
              ) : (
                <>
                  <View style={styles.sparkleContainer}>
                    <Sparkles size={32} color="#ffffff" />
                  </View>
                  <Text style={styles.mainButtonText}>ANALISAR PLANTA</Text>
                  <Text style={styles.mainButtonSubtext}>
                    Tire uma foto ou selecione da galeria
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: colors.surface, shadowColor: colors.shadow }]} onPress={takePhoto}>
            <View style={[styles.quickActionIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Camera size={24} color={colors.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: colors.surface, shadowColor: colors.shadow }]} onPress={pickImage}>
            <View style={[styles.quickActionIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <ImageIcon size={24} color={colors.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Galeria</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Dicas para Melhores Resultados</Text>
          <View style={[styles.tipItem, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <View style={[styles.tipIconContainer, { backgroundColor: colors.warning + '20' }]}>
              <Sun size={20} color={colors.warning} />
            </View>
            <Text style={[styles.tipText, { color: colors.text }]}>Tire fotos com boa iluminação natural</Text>
          </View>
          <View style={[styles.tipItem, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <View style={[styles.tipIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Search size={20} color={colors.primary} />
            </View>
            <Text style={[styles.tipText, { color: colors.text }]}>Foque em uma folha por vez</Text>
          </View>
          <View style={[styles.tipItem, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <View style={[styles.tipIconContainer, { backgroundColor: '#3b82f620' }]}>
              <CheckSquare size={20} color="#3b82f6" />
            </View>
            <Text style={[styles.tipText, { color: colors.text }]}>Mantenha a folha bem enquadrada</Text>
          </View>
        </View>
        </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 12,
    flex: 1,
  },
  actionSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  mainButton: {
    borderRadius: 20,
    minHeight: 160,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  mainButtonTouchable: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  sparkleContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mainButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 4,
    letterSpacing: 1,
  },
  mainButtonSubtext: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
  },
  quickActionButton: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  recentItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recentItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  recentItemText: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recentItemSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipsSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  tipItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
