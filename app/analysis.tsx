import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Send, RotateCcw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AnalysisScreen() {
  const { imageData } = useLocalSearchParams<{ imageData: string }>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async () => {
    if (!imageData) {
      setError('Imagem não encontrada para análise.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    const systemPrompt = "Você é um bot especializado em análise de plantas. Analise a imagem de uma folha e determine se ela está saudável ou com problemas. Forneça uma análise detalhada, incluindo possíveis doenças, pragas ou deficiências de nutrientes. Inclua recomendações específicas de tratamento. A resposta deve ser formatada em Markdown com seções claras.";
    
    const userQuery = "Analise esta imagem de uma folha de planta e me diga se ela parece saudável ou com algum problema. Inclua uma breve recomendação de tratamento se necessário.";
    
    const payload = {
        contents: [{
          parts: [
            { text: userQuery },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageData
              }
            }
          ]
        }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
    };
    
    const apiKey = "AIzaSyD-JLhuIwoEaDI6S0AU8_ECJ6chwD_1N8c";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 429) {
                    // Exponential backoff
                    const delay = Math.pow(2, retryCount) * 1000;
                    await new Promise(res => setTimeout(res, delay));
                    retryCount++;
                    continue;
                }
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();
            const analysisResult = result?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (analysisResult) {
                const analysis = {
                    id: Date.now().toString(),
                    imageData,
                    result: analysisResult,
                    timestamp: Date.now(),
                    isFavorite: false,
                };

                const existingAnalyses = await AsyncStorage.getItem('plant_analyses');
                const analyses = existingAnalyses ? JSON.parse(existingAnalyses) : [];
                analyses.unshift(analysis);
                await AsyncStorage.setItem('plant_analyses', JSON.stringify(analyses));

                router.replace({
                    pathname: '/result',
                    params: {
                        imageData,
                        result: analysisResult,
                        timestamp: analysis.timestamp.toString(),
                    },
                });
                return;
            } else {
                // Check if a safety filter was triggered
                const finishReason = result?.candidates?.[0]?.finishReason;
                if (finishReason === 'SAFETY') {
                    setError('A análise não pôde ser concluída devido a questões de segurança. Tente uma imagem diferente.');
                } else {
                    // If API response is invalid, log the issue and set an error
                    console.error('Invalid API response:', result);
                    setError('Resposta da API vazia ou inválida. Por favor, tente novamente.');
                }
                return; // Stop execution
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setError('Erro ao analisar a imagem. Verifique sua conexão e tente novamente.');
            return; // Stop execution on error
        } finally {
            setIsAnalyzing(false);
        }
    }
    
    setIsAnalyzing(false);
    setError('Falha ao analisar a imagem após várias tentativas. Por favor, tente novamente mais tarde.');
  };

  const retakePhoto = () => {
    router.back();
  };

  if (!imageData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro: Imagem não encontrada</Text>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Análise da Planta</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: `data:image/jpeg;base64,${imageData}` }} style={styles.image} />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>
            {isAnalyzing ? 'Analisando sua planta...' : 'Pronto para análise'}
          </Text>
          <Text style={styles.instructionsText}>
            {isAnalyzing
              ? 'Nossa IA está examinando a imagem e identificando possíveis problemas ou condições da planta.'
              : 'Confirme se a imagem está nítida e bem enquadrada, depois toque em "Analisar" para começar.'
            }
          </Text>
        </View>

        {isAnalyzing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.loadingText}>Processando imagem...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={retakePhoto}
          disabled={isAnalyzing}
        >
          <RotateCcw size={20} color="#6b7280" />
          <Text style={styles.secondaryButtonText}>Nova Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, isAnalyzing && styles.primaryButtonDisabled]}
          onPress={analyzeImage}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Send size={20} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Analisar</Text>
            </>
          )}
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    padding: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  instructionsContainer: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 16,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  primaryButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    gap: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
  },
});
