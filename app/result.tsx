import React, { useState } from 'react';
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

export default function ResultScreen() {
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

  const markdownStyles = {
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: '#374151',
    },
    heading1: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: 16,
      marginTop: 24,
    },
    heading2: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: 12,
      marginTop: 20,
    },
    heading3: {
      fontSize: 18,
      fontWeight: '600',
      color: '#374151',
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
      fontWeight: 'bold',
      color: '#1f2937',
    },
    em: {
      fontStyle: 'italic',
    },
    code_inline: {
      backgroundColor: '#f3f4f6',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 14,
      fontFamily: 'monospace',
    },
    blockquote: {
      backgroundColor: '#f0fdf4',
      borderLeftWidth: 4,
      borderLeftColor: '#22c55e',
      paddingLeft: 16,
      paddingVertical: 12,
      marginVertical: 16,
    },
    hr: {
      backgroundColor: '#e5e7eb',
      height: 1,
      marginVertical: 24,
    },
  };

  if (!imageData || !result) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro: Dados da análise não encontrados</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resultado da Análise</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleFavorite} style={styles.headerButton}>
            <Heart
              size={24}
              color={isFavorite ? '#ef4444' : '#6b7280'}
              fill={isFavorite ? '#ef4444' : 'none'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={shareResult} style={styles.headerButton}>
            <Share size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <Image source={{ uri: `data:image/jpeg;base64,${imageData}` }} style={styles.resultImage} />
          <Text style={styles.analysisDate}>
            Analisado em {formatDate(timestamp)}
          </Text>
        </View>

        <View style={styles.resultSection}>
          <Markdown style={markdownStyles}>
            {result}
          </Markdown>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.newAnalysisButton} onPress={newAnalysis}>
          <RotateCcw size={20} color="#ffffff" />
          <Text style={styles.newAnalysisButtonText}>Nova Análise</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  resultImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 12,
  },
  analysisDate: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  resultSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bottomActions: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  newAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#22c55e',
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
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#22c55e',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
