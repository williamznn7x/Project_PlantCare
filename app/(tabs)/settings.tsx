import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Camera, Trash2, Info, Shield, CircleHelp as HelpCircle, ExternalLink } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
  notifications: boolean;
  highQualityImages: boolean;
  autoSave: boolean;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    highQualityImages: true,
    autoSave: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('app_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      setSettings(newSettings);
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Limpar Todos os Dados',
      'Esta ação irá remover todas as análises salvas e configurações. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['plant_analyses', 'app_settings']);
              setSettings({
                notifications: true,
                highQualityImages: true,
                autoSave: true,
              });
              Alert.alert('Sucesso', 'Todos os dados foram removidos.');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível limpar os dados.');
            }
          },
        },
      ]
    );
  };

  const showAbout = () => {
    Alert.alert(
      'Sobre o PlantAI',
      'PlantAI v1.0.0\n\nUm aplicativo para análise de saúde de plantas usando inteligência artificial.\n\nDesenvolvido com React Native e Expo.',
      [{ text: 'OK' }]
    );
  };

  const showHelp = () => {
    Alert.alert(
      'Como Usar',
      '1. Tire uma foto ou selecione uma imagem da galeria\n2. Aguarde a análise da IA\n3. Visualize os resultados detalhados\n4. Salve suas análises favoritas\n\nDicas:\n• Use boa iluminação\n• Foque em uma folha por vez\n• Mantenha a imagem nítida',
      [{ text: 'OK' }]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    type = 'switch' 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    type?: 'switch' | 'button';
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#e5e7eb', true: '#86efac' }}
          thumbColor={value ? '#22c55e' : '#f3f4f6'}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Configurações</Text>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          
          <SettingItem
            icon={<Bell size={24} color="#6b7280" />}
            title="Notificações"
            subtitle="Receber lembretes e atualizações"
            value={settings.notifications}
            onValueChange={(value) => saveSettings({ ...settings, notifications: value })}
          />
          
          <SettingItem
            icon={<Camera size={24} color="#6b7280" />}
            title="Imagens de Alta Qualidade"
            subtitle="Melhor qualidade para análise mais precisa"
            value={settings.highQualityImages}
            onValueChange={(value) => saveSettings({ ...settings, highQualityImages: value })}
          />
          
          <SettingItem
            icon={<Shield size={24} color="#6b7280" />}
            title="Salvamento Automático"
            subtitle="Salvar análises automaticamente"
            value={settings.autoSave}
            onValueChange={(value) => saveSettings({ ...settings, autoSave: value })}
          />
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={clearAllData}>
            <View style={styles.settingIcon}>
              <Trash2 size={24} color="#ef4444" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: '#ef4444' }]}>
                Limpar Todos os Dados
              </Text>
              <Text style={styles.settingSubtitle}>
                Remove todas as análises e configurações
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={showHelp}>
            <View style={styles.settingIcon}>
              <HelpCircle size={24} color="#6b7280" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Como Usar</Text>
              <Text style={styles.settingSubtitle}>
                Guia de uso do aplicativo
              </Text>
            </View>
            <ExternalLink size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={showAbout}>
            <View style={styles.settingIcon}>
              <Info size={24} color="#6b7280" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Sobre</Text>
              <Text style={styles.settingSubtitle}>
                Informações do aplicativo
              </Text>
            </View>
            <ExternalLink size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>PlantAI v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Análise de plantas com inteligência artificial
          </Text>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  settingItem: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingIcon: {
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});