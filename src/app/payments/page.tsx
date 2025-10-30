'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, ChevronDown, LogOut, Calendar, DollarSign, CreditCard, ArrowLeft, Eye, Filter, Search, Settings } from 'lucide-react';
import { useApiCall } from '@/lib/api';

interface UserData {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  is_trial?: boolean;
  next_payment?: string;
  trial_expired?: boolean;
}

interface Payment {
  uuid: string;
  key: string;
  account: string;
  plan: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

interface PaymentsResponse {
  page: number;
  limit: number;
  hasNextPage: boolean;
  items: Payment[];
}

interface Plan {
  key: string;
  title: string;
  description: string[];
  amount: number;
}

interface PlansResponse {
  page: number;
  limit: number;
  hasNextPage: boolean | null;
  items: Plan[];
}

export default function PaymentsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('historico');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [limit] = useState(20);
  
  const router = useRouter();
  const { makeApiCall } = useApiCall();

  useEffect(() => {
    loadUserData();
    loadPayments();
    loadPlans();
  }, []);

  useEffect(() => {
    loadPayments();
  }, [currentPage]);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await makeApiCall('https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/me', {
        method: 'GET'
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
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
        company: 'Empresa Demo'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async (page: number = currentPage) => {
    try {
      setPaymentsLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await makeApiCall(`https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/payments?page=${page}&limit=${limit}`, {
        method: 'GET'
      });

      if (response.ok) {
        const paymentsData: PaymentsResponse = await response.json();
        
        if (paymentsData && typeof paymentsData === 'object' && 'items' in paymentsData) {
          setPayments(paymentsData.items || []);
          setCurrentPage(paymentsData.page || 1);
          setHasNextPage(paymentsData.hasNextPage || false);
          
          if (paymentsData.hasNextPage) {
            setTotalPages(paymentsData.page + 1);
          } else {
            setTotalPages(paymentsData.page);
          }
        } else {
          setPayments(Array.isArray(paymentsData) ? paymentsData : []);
          setHasNextPage(false);
          setTotalPages(1);
        }
      } else {
        throw new Error('Falha ao carregar pagamentos');
      }
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      setPayments([]);
      setHasNextPage(false);
      setTotalPages(1);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      setPlansLoading(true);
      
      // Nova API sem bearer token
      const response = await fetch('https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/plans', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const plansData: PlansResponse = await response.json();
        
        if (plansData && typeof plansData === 'object' && 'items' in plansData) {
          setPlans(plansData.items || []);
        } else {
          setPlans(Array.isArray(plansData) ? plansData : []);
        }
      } else {
        throw new Error('Falha ao carregar planos');
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  };

  const calculateDaysUntilPayment = (nextPayment: string): number => {
    const paymentDate = new Date(nextPayment);
    const today = new Date();
    const diffTime = paymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (amountInCents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amountInCents / 100);
  };

  const getPlanTitle = (planKey: string) => {
    const plan = plans.find(p => p.key === planKey);
    return plan ? plan.title : planKey;
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setTotalPages(Math.max(totalPages, newPage));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const filteredPayments = payments.filter(payment =>
    getPlanTitle(payment.plan).toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPlans = plans.filter(plan =>
    plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.key?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Pagamentos</h1>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block font-medium">{user?.name || 'Usuário'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <ArrowLeft className="w-4 h-4 mr-3" />
                    Dashboard
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Pagamentos</h2>
          <p className="text-gray-600">Visualize seu histórico de pagamentos e gerencie seus planos.</p>
        </div>

        {/* Trial Status Card */}
        {user?.is_trial && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-orange-900">Status do Trial</h3>
                <p className="text-orange-700">
                  {user.next_payment 
                    ? `Seu período de teste expira em ${calculateDaysUntilPayment(user.next_payment)} dias`
                    : 'Período de teste ativo'
                  }
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('planos')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Escolher Plano
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['historico', 'planos'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'historico' ? 'Histórico de Pagamentos' : 'Planos Disponíveis'}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {activeTab === 'historico' && (
              <div>
                {/* Search and Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar pagamentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => loadPayments(currentPage)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      disabled={paymentsLoading}
                    >
                      {paymentsLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Settings className="w-4 h-4 mr-2" />
                      )}
                      Atualizar
                    </button>
                  </div>
                </div>

                {/* Payments List */}
                {paymentsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando pagamentos...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4">
                      {filteredPayments.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                          <div className="p-4">
                            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg font-medium mb-2">Nenhum pagamento encontrado</p>
                            <p className="text-gray-400">Seus pagamentos aparecerão aqui quando realizados.</p>
                          </div>
                        </div>
                      ) : (
                        filteredPayments.map((payment) => (
                          <div key={payment.uuid} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-gray-900 truncate">
                                    {getPlanTitle(payment.plan)}
                                  </h3>
                                  <p className="text-sm text-gray-600 truncate">
                                    ID: {payment.key}
                                  </p>
                                  <p className="text-sm text-gray-600 truncate">
                                    Plano: {payment.plan}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-lg font-semibold text-gray-900">
                                    {formatPrice(payment.amount)}
                                  </span>
                                  <p className="text-sm text-gray-500">
                                    {payment.amount === 0 ? 'Gratuito' : 'Pago'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Criado: {formatDate(payment.created_at)}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Atualizado: {formatDate(payment.updated_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Pagination */}
                    {(totalPages > 1 || hasNextPage) && (
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Página {currentPage} {totalPages > 1 && `de ${totalPages}`}</span>
                          <span className="ml-4">{filteredPayments.length} pagamentos exibidos</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Anterior
                          </button>
                          
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              const pageNum = Math.max(1, currentPage - 2) + i;
                              if (pageNum > totalPages) return null;
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                    pageNum === currentPage
                                      ? 'bg-blue-600 text-white'
                                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <button
                            onClick={handleNextPage}
                            disabled={!hasNextPage}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Próxima
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'planos' && (
              <div>
                {/* Search and Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar planos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => loadPlans()}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      disabled={plansLoading}
                    >
                      {plansLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Settings className="w-4 h-4 mr-2" />
                      )}
                      Atualizar
                    </button>
                  </div>
                </div>

                {/* Plans List */}
                {plansLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando planos...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlans.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <p className="text-gray-500">Nenhum plano encontrado</p>
                      </div>
                    ) : (
                      filteredPlans.map((plan) => (
                        <div key={plan.key} className={`border rounded-lg p-6 transition-all hover:shadow-lg ${
                          plan.key === 'standard' 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="space-y-4">
                            {plan.key === 'standard' && (
                              <div className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full text-center">
                                RECOMENDADO
                              </div>
                            )}
                            
                            <div className="text-center">
                              <h3 className="text-xl font-semibold text-gray-900">{plan.title}</h3>
                              <div className="mt-2">
                                <span className="text-3xl font-bold text-gray-900">
                                  {formatPrice(plan.amount)}
                                </span>
                                {plan.amount > 0 && (
                                  <span className="text-gray-600">/mês</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {plan.description.map((feature, index) => (
                                <div key={index} className="flex items-center text-sm text-gray-600">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 flex-shrink-0"></div>
                                  {feature}
                                </div>
                              ))}
                            </div>
                            
                            <button 
                              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                                plan.key === 'trial' 
                                  ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-not-allowed'
                                  : plan.key === 'standard'
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-600 text-white hover:bg-gray-700'
                              }`}
                              disabled={plan.key === 'trial'}
                            >
                              {plan.key === 'trial' ? 'Plano Atual' : 'Escolher Plano'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}