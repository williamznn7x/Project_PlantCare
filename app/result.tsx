import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Heart, Share, RotateCcw } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import GlitterBackground from '@/components/GlitterBackground';

export default function ResultScreen() {
  const { colors, theme } = useTheme();
  const { imageData, result, timestamp } = useLocalSearchParams<{
    imageData: string;
    result: string;
    timestamp: string;
  }>();
  
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem('plant_analyses');
      if (stored) {
        const analyses = JSON.parse(stored);
        const updatedAnalyses = analyses.map((analysis: any) =>
          analysis.timestamp.toString() === timestamp
            ? { ...analysis, isFavorite: !analysis.isFavorite }
            : analysis
        );
        await AsyncStorage.setItem('plant_analyses', JSON.stringify(updatedAnalyses));
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const shareResult = async () => {
    try {
      const shareContent = `Análise de Planta - PlantAI\n\n${result}`;
      await Sharing.shareAsync('data:text/plain;base64,' + btoa(shareContent));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar a análise.');
    }
  };

  const newAnalysis = () => {
    router.push('/(tabs)');
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp)).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  if (!imageData || !result) {
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
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>Erro: Dados da análise não encontrados</Text>
              <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

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
        <GlitterBackground starCount={34} size={8} color="#22c55e" />
        <GlitterBackground starCount={34} size={8} color="#22c55e" />
        <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Resultado da Análise</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleFavorite} style={styles.headerButton}>
            <Heart
              size={24}
              color={isFavorite ? colors.error : colors.textSecondary}
              fill={isFavorite ? colors.error : 'none'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={shareResult} style={styles.headerButton}>
            <Share size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.imageSection, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Image source={{ uri: `data:image/jpeg;base64,${imageData}` }} style={styles.resultImage} />
          <Text style={[styles.analysisDate, { color: colors.textSecondary }]}>
            Analisado em {formatDate(timestamp)}
          </Text>
        </View>

        <View style={[styles.resultSection, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <Markdown style={{
            body: {
              fontSize: 16,
              lineHeight: 24,
              color: colors.text,
            },
            heading1: {
              fontSize: 24,
              fontWeight: 'bold' as const,
              color: colors.text,
              marginBottom: 16,
              marginTop: 24,
            },
            heading2: {
              fontSize: 20,
              fontWeight: 'bold' as const,
              color: colors.text,
              marginBottom: 12,
              marginTop: 20,
            },
            heading3: {
              fontSize: 18,
              fontWeight: '600' as const,
              color: colors.text,
              marginBottom: 8,
              marginTop: 16,
            },
            paragraph: {
              marginBottom: 12,
              lineHeight: 24,
            },
            list_item: {
              marginBottom: 8,
            },
            bullet_list: {
              marginBottom: 16,
            },
            ordered_list: {
              marginBottom: 16,
            },
            strong: {
              fontWeight: 'bold' as const,
              color: colors.text,
            },
            em: {
              fontStyle: 'italic' as const,
            },
            code_inline: {
              backgroundColor: colors.border,
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 4,
              fontSize: 14,
              fontFamily: 'monospace',
            },
            blockquote: {
              backgroundColor: colors.surface,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
              paddingLeft: 16,
              paddingVertical: 12,
              marginVertical: 16,
            },
            hr: {
              backgroundColor: colors.border,
              height: 1,
              marginVertical: 24,
            },
          }}>
            {result}
          </Markdown>
        </View>
      </ScrollView>

      <View style={[styles.bottomActions, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.newAnalysisButton, { backgroundColor: colors.primary }]} onPress={newAnalysis}>
          <RotateCcw size={20} color="#ffffff" />
          <Text style={styles.newAnalysisButtonText}>Nova Análise</Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
  },
  resultImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 12,
  },
  analysisDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultSection: {
    padding: 24,
    margin: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bottomActions: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  newAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  newAnalysisButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
