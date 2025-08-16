
import { supabase } from '@/integrations/supabase/client';

export interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
}

export class DiagnosticRunner {
  static async runAuthCheck(): Promise<DiagnosticResult> {
    try {
      console.log('Running authentication check...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        return {
          name: 'Autenticação',
          status: 'error',
          message: `Erro de autenticação: ${authError.message}`
        };
      }
      
      if (!user) {
        return {
          name: 'Autenticação',
          status: 'error',
          message: 'Usuário não autenticado. Faça login para acessar as configurações.'
        };
      }
      
      return {
        name: 'Autenticação',
        status: 'success',
        message: `Usuário autenticado: ${user.email || 'Email não disponível'}`
      };
    } catch (error) {
      console.error('Auth check failed:', error);
      return {
        name: 'Autenticação',
        status: 'error',
        message: 'Erro inesperado na verificação de autenticação'
      };
    }
  }

  static async runDatabaseCheck(): Promise<DiagnosticResult> {
    try {
      console.log('Running database connection check...');
      const { data, error: connectionError } = await supabase
        .from('company_settings')
        .select('id')
        .limit(1);
      
      if (connectionError) {
        console.error('Database error:', connectionError);
        return {
          name: 'Conexão Database',
          status: 'error',
          message: `Erro de conexão: ${connectionError.message}`
        };
      }
      
      return {
        name: 'Conexão Database',
        status: 'success',
        message: 'Conexão com o banco de dados funcionando normalmente'
      };
    } catch (error) {
      console.error('Database check failed:', error);
      return {
        name: 'Conexão Database',
        status: 'error',
        message: 'Erro inesperado na conexão com o banco de dados'
      };
    }
  }

  static async runCompanySettingsCheck(): Promise<DiagnosticResult> {
    try {
      console.log('Running company settings check...');
      const { data: settings, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Company settings error:', error);
        return {
          name: 'Configurações da Empresa',
          status: 'error',
          message: `Erro ao carregar configurações: ${error.message}`
        };
      }

      if (!settings) {
        return {
          name: 'Configurações da Empresa',
          status: 'warning',
          message: 'Nenhuma configuração encontrada. Configure sua empresa primeiro.'
        };
      }

      const missing = [];
      if (!settings.company_name) missing.push('Nome da empresa');
      if (!settings.company_address) missing.push('Endereço');
      if (!settings.whatsapp_number) missing.push('WhatsApp');

      if (missing.length > 0) {
        return {
          name: 'Configurações da Empresa',
          status: 'warning',
          message: `Campos obrigatórios em falta: ${missing.join(', ')}`
        };
      }

      return {
        name: 'Configurações da Empresa',
        status: 'success',
        message: 'Todas as configurações obrigatórias estão preenchidas'
      };
    } catch (error) {
      console.error('Company settings check failed:', error);
      return {
        name: 'Configurações da Empresa',
        status: 'error',
        message: 'Erro inesperado ao verificar configurações da empresa'
      };
    }
  }

  static runLocalStorageCheck(): DiagnosticResult {
    try {
      console.log('Running localStorage check...');
      const requiredItems = ['companySettings'];
      const optionalItems = ['companyLogo', 'selected-theme'];
      
      const missingRequired = requiredItems.filter(item => !localStorage.getItem(item));
      const missingOptional = optionalItems.filter(item => !localStorage.getItem(item));

      if (missingRequired.length > 0) {
        return {
          name: 'Armazenamento Local',
          status: 'error',
          message: `Dados obrigatórios em falta: ${missingRequired.join(', ')}`
        };
      }

      if (missingOptional.length > 0) {
        return {
          name: 'Armazenamento Local',
          status: 'warning',
          message: `Dados opcionais em falta: ${missingOptional.join(', ')}`
        };
      }

      return {
        name: 'Armazenamento Local',
        status: 'success',
        message: 'Todos os dados locais estão configurados'
      };
    } catch (error) {
      console.error('LocalStorage check failed:', error);
      return {
        name: 'Armazenamento Local',
        status: 'error',
        message: 'Erro ao verificar armazenamento local'
      };
    }
  }

  static async runRLSCheck(): Promise<DiagnosticResult> {
    try {
      console.log('Running RLS policies check...');
      
      // Test RLS on company_settings
      const { data: companyData, error: companyError } = await supabase
        .from('company_settings')
        .select('id')
        .limit(1);

      if (companyError && companyError.code !== 'PGRST116') {
        return {
          name: 'Políticas de Segurança',
          status: 'error',
          message: `Erro nas políticas RLS (company_settings): ${companyError.message}`
        };
      }

      // Test RLS on orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .limit(1);

      if (ordersError && ordersError.code !== 'PGRST116') {
        return {
          name: 'Políticas de Segurança',
          status: 'error',
          message: `Erro nas políticas RLS (orders): ${ordersError.message}`
        };
      }

      return {
        name: 'Políticas de Segurança',
        status: 'success',
        message: 'Políticas de segurança funcionando corretamente'
      };
    } catch (error) {
      console.error('RLS check failed:', error);
      return {
        name: 'Políticas de Segurança',
        status: 'error',
        message: 'Erro inesperado ao verificar políticas de segurança'
      };
    }
  }

  static async runAllDiagnostics(): Promise<DiagnosticResult[]> {
    console.log('Starting system diagnostics...');
    const results: DiagnosticResult[] = [];

    try {
      // Run checks in sequence to avoid overwhelming the system
      results.push(await this.runAuthCheck());
      results.push(await this.runDatabaseCheck());
      results.push(await this.runCompanySettingsCheck());
      results.push(this.runLocalStorageCheck());
      results.push(await this.runRLSCheck());

      console.log('All diagnostics completed:', results);
      return results;
    } catch (error) {
      console.error('Diagnostic runner failed:', error);
      results.push({
        name: 'Sistema Geral',
        status: 'error',
        message: 'Erro inesperado durante execução dos diagnósticos'
      });
      return results;
    }
  }
}
