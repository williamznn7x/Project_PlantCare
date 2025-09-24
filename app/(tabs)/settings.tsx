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
import { Bell, Camera, Trash2, Info, Shield, CircleHelp as HelpCircle, ExternalLink, Moon, Sun } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import GlitterBackground from '@/components/GlitterBackground';

interface Settings {
  notifications: boolean;
  highQualityImages: boolean;
  autoSave: boolean;
}

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useTheme();
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
    <View style={[styles.settingItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: '#86efac' }}
          thumbColor={value ? colors.primary : colors.textSecondary}
        />
      )}
    </View>
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
        <GlitterBackground starCount={30} size={8} color="#22c55e" />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Configurações</Text>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferências</Text>
          
          <SettingItem
            icon={theme === 'dark' ? <Sun size={24} color={colors.warning} /> : <Moon size={24} color={colors.textSecondary} />}
            title="Tema Escuro"
            subtitle={theme === 'dark' ? 'Ativado' : 'Desativado'}
            value={theme === 'dark'}
            onValueChange={toggleTheme}
          />
          
          <SettingItem
            icon={<Bell size={24} color={colors.textSecondary} />}
            title="Notificações"
            subtitle="Receber lembretes e atualizações"
            value={settings.notifications}
            onValueChange={(value) => saveSettings({ ...settings, notifications: value })}
          />
          
          <SettingItem
            icon={<Camera size={24} color={colors.textSecondary} />}
            title="Imagens de Alta Qualidade"
            subtitle="Melhor qualidade para análise mais precisa"
            value={settings.highQualityImages}
            onValueChange={(value) => saveSettings({ ...settings, highQualityImages: value })}
          />
          
          <SettingItem
            icon={<Shield size={24} color={colors.textSecondary} />}
            title="Salvamento Automático"
            subtitle="Salvar análises automaticamente"
            value={settings.autoSave}
            onValueChange={(value) => saveSettings({ ...settings, autoSave: value })}
          />
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Dados</Text>
          
          <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]} onPress={clearAllData}>
            <View style={styles.settingIcon}>
              <Trash2 size={24} color={colors.error} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: colors.error }]}>
                Limpar Todos os Dados
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Remove todas as análises e configurações
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Suporte</Text>
          
          <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]} onPress={showHelp}>
            <View style={styles.settingIcon}>
              <HelpCircle size={24} color={colors.textSecondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Como Usar</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Guia de uso do aplicativo
              </Text>
            </View>
            <ExternalLink size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]} onPress={showAbout}>
            <View style={styles.settingIcon}>
              <Info size={24} color={colors.textSecondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Sobre</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Informações do aplicativo
              </Text>
            </View>
            <ExternalLink size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text }]}>PlantAI v1.0.0</Text>
          <Text style={[styles.footerSubtext, { color: colors.textSecondary }]}>
            Análise de plantas com inteligência artificial
          </Text>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
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
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
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
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});