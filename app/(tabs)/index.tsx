import { useState, useEffect } from 'react';
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
import { Camera, Image as ImageIcon, Sparkles, Leaf } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Analysis {
  id: string;
  imageData: string;
  result: string;
  timestamp: number;
  isFavorite?: boolean;
}

export default function HomeScreen() {
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
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Leaf size={32} color="#22c55e" />
            <Text style={styles.headerTitle}>PlantAI</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Analise a saúde das suas plantas com inteligência artificial
          </Text>
        </View>

        <View style={styles.actionSection}>
          <LinearGradient
            colors={['#22c55e', '#16a34a']}
            style={styles.mainButton}
          >
            <TouchableOpacity
              style={styles.mainButtonContent}
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
                  <Sparkles size={32} color="#ffffff" />
                  <Text style={styles.mainButtonText}>Analisar Planta</Text>
                  <Text style={styles.mainButtonSubtext}>
                    Tire uma foto ou selecione da galeria
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={takePhoto}>
            <Camera size={24} color="#22c55e" />
            <Text style={styles.quickActionText}>Câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={pickImage}>
            <ImageIcon size={24} color="#22c55e" />
            <Text style={styles.quickActionText}>Galeria</Text>
          </TouchableOpacity>
        </View>

        {recentAnalyses.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Análises Recentes</Text>
            {recentAnalyses.map((analysis) => (
              <TouchableOpacity
                key={analysis.id}
                style={styles.recentItem}
                onPress={() => router.push({
                  pathname: '/result',
                  params: {
                    imageData: analysis.imageData,
                    result: analysis.result,
                    timestamp: analysis.timestamp.toString(),
                  },
                })}
              >
                <View style={styles.recentItemContent}>
                  <Image source={{ uri: `data:image/jpeg;base64,${analysis.imageData}` }} style={styles.recentItemImage} />
                  <View style={styles.recentItemText}>
                    <Text style={styles.recentItemTitle}>
                      Análise de {formatDate(analysis.timestamp)}
                    </Text>
                    <Text style={styles.recentItemSubtitle} numberOfLines={2}>
                      {analysis.result}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/history')}
            >
              <Text style={styles.viewAllText}>Ver Todas as Análises</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Dicas para Melhores Resultados</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>📸 Tire fotos com boa iluminação natural</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>🍃 Foque em uma folha por vez</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>🔍 Mantenha a folha bem enquadrada</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  actionSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  mainButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  mainButtonContent: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  mainButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 4,
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
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  recentSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  recentItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
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
    color: '#1f2937',
    marginBottom: 4,
  },
  recentItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
  },
  tipsSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  tipItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
