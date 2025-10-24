'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, CreditCard, Calendar, DollarSign, AlertCircle, Crown, Zap, Star } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  is_trial?: boolean;
  next_payment?: string;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

export default function PaymentsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Planos disponíveis
  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Básico',
      price: 29.90,
      period: 'mês',
      icon: <Star className="w-6 h-6" />,
      features: [
        'Até 1.000 leads por mês',
        'Dashboard básico',
        'Suporte por email',
        '1 campanha ativa',
        'Relatórios básicos'
      ]
    },
    {
      id: 'pro',
      name: 'Profissional',
      price: 79.90,
      period: 'mês',
      popular: true,
      icon: <Zap className="w-6 h-6" />,
      features: [
        'Até 10.000 leads por mês',
        'Dashboard avançado',
        'Suporte prioritário',
        'Campanhas ilimitadas',
        'Relatórios avançados',
        'Integração com WhatsApp',
        'API de integração'
      ]
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      price: 199.90,
      period: 'mês',
      icon: <Crown className="w-6 h-6" />,
      features: [
        'Leads ilimitados',
        'Dashboard personalizado',
        'Suporte 24/7',
        'Campanhas ilimitadas',
        'Relatórios personalizados',
        'Integração completa',
        'API avançada',
        'Gerente de conta dedicado',
        'Treinamento personalizado'
      ]
    }
  ];

  // Histórico de pagamentos simulado
  const mockPayments: Payment[] = [
    {
      id: '1',
      date: '2024-01-15',
      amount: 79.90,
      status: 'paid',
      description: 'Plano Profissional - Janeiro 2024'
    },
    {
      id: '2',
      date: '2023-12-15',
      amount: 79.90,
      status: 'paid',
      description: 'Plano Profissional - Dezembro 2023'
    },
    {
      id: '3',
      date: '2023-11-15',
      amount: 79.90,
      status: 'paid',
      description: 'Plano Profissional - Novembro 2023'
    },
    {
      id: '4',
      date: '2023-10-15',
      amount: 29.90,
      status: 'failed',
      description: 'Plano Básico - Outubro 2023'
    }
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch('https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Se não for trial, carregar histórico de pagamentos
        if (!userData.is_trial) {
          setPayments(mockPayments);
        }
      } else {
        throw new Error('Falha ao carregar dados do usuário');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Usar dados simulados em caso de erro
      setUser({
        id: '1',
        name: 'Usuário Demo',
        email: 'demo@email.com',
        is_trial: true,
        next_payment: '2024-01-27'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const handleSelectPlan = (planId: string) => {
    // Aqui você implementaria a lógica de seleção do plano
    console.log('Plano selecionado:', planId);
    // Redirecionar para checkout ou abrir modal de pagamento
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações de pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar ao Dashboard
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {user?.is_trial ? 'Escolha seu Plano' : 'Meus Pagamentos'}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user?.is_trial ? (
          // Mostrar planos para usuários trial
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Escolha o plano ideal para seu negócio
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Desbloqueie todo o potencial do LeadManager com nossos planos profissionais.
                Comece hoje mesmo e transforme seus leads em vendas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                    plan.popular 
                      ? 'border-blue-500 transform scale-105' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Mais Popular
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
                      <div className="text-blue-600">
                        {plan.icon}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                      {plan.name}
                    </h3>

                    <div className="text-center mb-6">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatCurrency(plan.price)}
                      </span>
                      <span className="text-gray-600">/{plan.period}</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      Escolher {plan.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Garantia e Suporte */}
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="flex items-center justify-center space-x-8 mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Garantia de 30 dias</p>
                    <p className="text-sm text-gray-600">Satisfação garantida</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Pagamento seguro</p>
                    <p className="text-sm text-gray-600">Dados protegidos</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <AlertCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Suporte dedicado</p>
                    <p className="text-sm text-gray-600">Ajuda quando precisar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Mostrar histórico de pagamentos para usuários não-trial
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Histórico de Pagamentos</h2>
              <p className="text-gray-600">
                Acompanhe todos os seus pagamentos e faturas do LeadManager.
              </p>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Pago</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Próximo Pagamento</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {user?.next_payment ? formatDate(user.next_payment) : '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Plano Atual</p>
                    <p className="text-2xl font-bold text-gray-900">Profissional</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Pagamentos */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Histórico de Transações</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                            {getStatusText(payment.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {payments.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum pagamento encontrado</p>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <CreditCard className="w-5 h-5 mr-2" />
                Alterar Método de Pagamento
              </button>
              <button className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Calendar className="w-5 h-5 mr-2" />
                Alterar Plano
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}