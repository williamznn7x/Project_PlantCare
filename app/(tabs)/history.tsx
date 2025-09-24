import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Trash2, Share, Calendar } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';

interface Analysis {
  id: string;
  imageUri: string;
  result: string;
  timestamp: number;
  isFavorite?: boolean;
}

export default function HistoryScreen() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const stored = await AsyncStorage.getItem('plant_analyses');
      if (stored) {
        const parsedAnalyses = JSON.parse(stored);
        setAnalyses(parsedAnalyses.sort((a: Analysis, b: Analysis) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const updatedAnalyses = analyses.map(analysis =>
        analysis.id === id
          ? { ...analysis, isFavorite: !analysis.isFavorite }
          : analysis
      );
      setAnalyses(updatedAnalyses);
      await AsyncStorage.setItem('plant_analyses', JSON.stringify(updatedAnalyses));
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const deleteAnalysis = async (id: string) => {
    Alert.alert(
      'Excluir Análise',
      'Tem certeza que deseja excluir esta análise?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedAnalyses = analyses.filter(analysis => analysis.id !== id);
              setAnalyses(updatedAnalyses);
              await AsyncStorage.setItem('plant_analyses', JSON.stringify(updatedAnalyses));
            } catch (error) {
              console.error('Error deleting analysis:', error);
            }
          },
        },
      ]
    );
  };

  const shareAnalysis = async (analysis: Analysis) => {
    try {
      const shareContent = `Análise de Planta - PlantAI\n\n${analysis.result}`;
      await Sharing.shareAsync('data:text/plain;base64,' + btoa(shareContent));
    } catch (error) {
      console.error('Error sharing analysis:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredAnalyses = filter === 'favorites'
    ? analyses.filter(analysis => analysis.isFavorite)
    : analyses;

  const renderAnalysisItem = ({ item }: { item: Analysis }) => (
    <TouchableOpacity
      style={styles.analysisItem}
      onPress={() => router.push({
        pathname: '/result',
        params: { 
          imageUri: item.imageUri,
          result: item.result,
          timestamp: item.timestamp.toString()
        }
      })}
    >
      <Image source={{ uri: item.imageUri }} style={styles.analysisImage} />
      <View style={styles.analysisContent}>
        <View style={styles.analysisHeader}>
          <Text style={styles.analysisDate}>
            {formatDate(item.timestamp)}
          </Text>
          <View style={styles.analysisActions}>
            <TouchableOpacity
              onPress={() => toggleFavorite(item.id)}
              style={styles.actionButton}
            >
              <Heart
                size={20}
                color={item.isFavorite ? '#ef4444' : '#9ca3af'}
                fill={item.isFavorite ? '#ef4444' : 'none'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => shareAnalysis(item)}
              style={styles.actionButton}
            >
              <Share size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteAnalysis(item.id)}
              style={styles.actionButton}
            >
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.analysisPreview} numberOfLines={3}>
          {item.result.substring(0, 150)}...
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Histórico de Análises</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'favorites' && styles.filterButtonActive]}
            onPress={() => setFilter('favorites')}
          >
            <Text style={[styles.filterButtonText, filter === 'favorites' && styles.filterButtonTextActive]}>
              Favoritas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredAnalyses.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar size={64} color="#d1d5db" />
          <Text style={styles.emptyStateTitle}>
            {filter === 'favorites' ? 'Nenhuma análise favorita' : 'Nenhuma análise ainda'}
          </Text>
          <Text style={styles.emptyStateSubtitle}>
            {filter === 'favorites'
              ? 'Marque suas análises favoritas para vê-las aqui'
              : 'Comece analisando uma planta na aba principal'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAnalyses}
          renderItem={renderAnalysisItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 24,
    paddingTop: 8,
  },
  analysisItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  analysisImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  analysisContent: {
    flex: 1,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  analysisDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  analysisActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  analysisPreview: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});