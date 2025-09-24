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
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import GlitterBackground from '@/components/GlitterBackground';

interface Analysis {
  id: string;
  imageUri: string;
  result: string;
  timestamp: number;
  isFavorite?: boolean;
}

export default function HistoryScreen() {
  const { colors, theme } = useTheme();
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
      style={[styles.analysisItem, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
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
          <Text style={[styles.analysisDate, { color: colors.text }]}>
            {formatDate(item.timestamp)}
          </Text>
          <View style={styles.analysisActions}>
            <TouchableOpacity
              onPress={() => toggleFavorite(item.id)}
              style={styles.actionButton}
            >
              <Heart
                size={20}
                color={item.isFavorite ? colors.error : colors.textSecondary}
                fill={item.isFavorite ? colors.error : 'none'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => shareAnalysis(item)}
              style={styles.actionButton}
            >
              <Share size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteAnalysis(item.id)}
              style={styles.actionButton}
            >
              <Trash2 size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.analysisPreview, { color: colors.textSecondary }]} numberOfLines={3}>
          {item.result.substring(0, 150)}...
        </Text>
      </View>
    </TouchableOpacity>
  );

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
        <GlitterBackground starCount={40} size={8} color="#22c55e" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Histórico de Análises</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton, 
              { backgroundColor: colors.surface, borderColor: colors.border },
              filter === 'all' && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={[
              styles.filterButtonText, 
              { color: colors.textSecondary },
              filter === 'all' && { color: '#ffffff' }
            ]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton, 
              { backgroundColor: colors.surface, borderColor: colors.border },
              filter === 'favorites' && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setFilter('favorites')}
          >
            <Text style={[
              styles.filterButtonText, 
              { color: colors.textSecondary },
              filter === 'favorites' && { color: '#ffffff' }
            ]}>
              Favoritas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredAnalyses.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            {filter === 'favorites' ? 'Nenhuma análise favorita' : 'Nenhuma análise ainda'}
          </Text>
          <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
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
    borderWidth: 1,
  },
  filterButtonActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 24,
    paddingTop: 8,
  },
  analysisItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
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
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});