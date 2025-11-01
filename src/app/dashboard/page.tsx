'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, ChevronDown, Settings, CreditCard, LogOut, Search, Filter, Users, TrendingUp, MousePointer, DollarSign, MapPin, Smartphone, Globe, Calendar, Eye, ExternalLink, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Copy, Mail, Phone, AlertTriangle, Save, X, Lock, Star, Code, EyeOff } from 'lucide-react';
import { useApiCall } from '@/lib/api';
import { formatPhoneForDisplay, formatPhoneForApi, applyPhoneMask, isValidPhone } from '@/lib/phone-utils';

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

interface DashboardStats {
  total_hists: number;
  total_leads: number;
  percent_leads: number;
  totat_linked: number;
}

interface LeadContent {
  updated_at: string;
  phone: string;
  link: string;
  name: string;
  active: boolean;
  created_at: string;
  message: string;
  uuid: string;
  account: string;
  script: string;
}

interface LeadLocation {
  country: string;
  country_code: string;
  city: string;
  timezone: string;
  ip: string;
  latitude: number;
  isp: string;
  source: string;
  region: string;
  longitude: number;
}

interface LeadAgent {
  cpu: any;
  ua: string;
  os: { name: string; version: string };
  device: { model: string; vendor: string };
  engine: { name: string; version: string };
  browser: { name: string; major: string; version: string };
}

interface LeadAccess {
  createdAt: number;
  page?: string;
}

interface Lead {
  content: LeadContent;
  rate: number;
  location: LeadLocation;
  created_at: string;
  redirect_link: string;
  status: string;
  access: LeadAccess[];
  name: string | null;
  updated_at: string;
  sender: string;
  code: string;
  clientAgent: string;
  queryStringParameters: { [key: string]: any };
  agent: LeadAgent;
  phone_number: string | null;
  account: string;
  uuid: string;
  clientIp: string;
  campaign: string;
  id: string;
  key: string;
  email?: string | null;
}

interface LeadDetail extends Lead {
  // Campos adicionais que podem vir no detalhe
}

interface LeadsResponse {
  page: number;
  limit: number;
  hasNextPage: boolean;
  items: Lead[];
}

interface Campaign {
  script: string;
  updated_at: string;
  active: boolean;
  created_at: string;
  account: string;
  uuid: string;
  message: string;
  link: string;
  name: string;
  phone: string;
}

interface CampaignsResponse {
  page: number;
  limit: number;
  hasNextPage: boolean;
  items: Campaign[];
}

interface Seller {
  uuid: string;
  name: string;
  phone: string;
  message: string;
  link: string;
  email: string;
  password: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  account: string;
}

interface SellersResponse {
  page: number;
  limit: number;
  hasNextPage: boolean;
  items: Seller[];
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

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadDetail | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [sellersLoading, setSellersLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLeadDetail, setShowLeadDetail] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [isEditingCampaign, setIsEditingCampaign] = useState(false);
  const [isEditingSeller, setIsEditingSeller] = useState(false);
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSellerPassword, setShowSellerPassword] = useState(false);
  
  // Dashboard stats from API
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_hists: 0,
    total_leads: 0,
    percent_leads: 0,
    totat_linked: 0
  });
  
  // Pagination states for leads
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [limit] = useState(20);
  
  // Pagination states for campaigns
  const [campaignCurrentPage, setCampaignCurrentPage] = useState(1);
  const [campaignTotalPages, setCampaignTotalPages] = useState(1);
  const [campaignHasNextPage, setCampaignHasNextPage] = useState(false);
  
  // Pagination states for sellers
  const [sellerCurrentPage, setSellerCurrentPage] = useState(1);
  const [sellerTotalPages, setSellerTotalPages] = useState(1);
  const [sellerHasNextPage, setSellerHasNextPage] = useState(false);
  
  // Filter states
  const [phoneFilter, setPhoneFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [utmFilter, setUtmFilter] = useState('');
  const [dateStartFilter, setDateStartFilter] = useState('');
  const [dateEndFilter, setDateEndFilter] = useState('');
  
  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    phone: '',
    message: '',
    link: 'https://api.whatsapp.com/send',
    active: true
  });
  
  // Seller form state
  const [sellerForm, setSellerForm] = useState({
    name: '',
    phone: '',
    message: '',
    link: 'https://api.whatsapp.com/send',
    email: '',
    password: '',
    active: true
  });

  // Original seller data for comparison
  const [originalSellerData, setOriginalSellerData] = useState({
    name: '',
    phone: '',
    message: '',
    link: '',
    email: '',
    password: '',
    active: true
  });

  // Lead edit form state
  const [leadEditForm, setLeadEditForm] = useState({
    name: '',
    phone_number: '',
    status: '',
    rate: 0
  });

  // Change password form state
  const [changePasswordForm, setChangePasswordForm] = useState({
    password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const router = useRouter();
  const { makeApiCall } = useApiCall();

  useEffect(() => {
    loadUserData();
    loadLeads();
    loadDashboardStats();
  }, []);

  useEffect(() => {
    loadLeads();
  }, [currentPage, phoneFilter, statusFilter, codeFilter, utmFilter, dateStartFilter, dateEndFilter]);

  useEffect(() => {
    if (activeTab === 'campanhas') {
      loadCampaigns();
    } else if (activeTab === 'vendedores') {
      loadSellers();
    } else if (activeTab === 'planos') {
      loadPlans();
    }
  }, [activeTab, campaignCurrentPage, sellerCurrentPage]);

  const loadDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await makeApiCall('https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/dashboard-home', {
        method: 'GET'
      });

      if (response.ok) {
        const stats: DashboardStats = await response.json();
        setDashboardStats(stats);
      } else {
        throw new Error('Falha ao carregar estatísticas');
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Manter valores padrão em caso de erro
    } finally {
      setStatsLoading(false);
    }
  };

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
        
        // Verificar se o trial expirou
        if (userData.trial_expired || (userData.is_trial && userData.next_payment && calculateDaysUntilPayment(userData.next_payment) <= 0)) {
          router.push('/payments');
          return;
        }
      } else {
        throw new Error('Falha ao carregar dados do usuário');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados do usuário');
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

  const calculateDaysUntilPayment = (nextPayment: string): number => {
    const paymentDate = new Date(nextPayment);
    const today = new Date();
    const diffTime = paymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getUtmTags = (queryStringParameters: { [key: string]: any }): Array<{key: string, value: string}> => {
    if (!queryStringParameters) return [];
    
    return Object.entries(queryStringParameters)
      .filter(([key]) => key.toLowerCase().startsWith('utm_'))
      .map(([key, value]) => ({ key, value: String(value) }));
  };

  const buildLeadsUrl = () => {
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());
    params.append('limit', limit.toString());
    
    if (phoneFilter) {
      // Converter telefone para formato da API antes de enviar
      const phoneForApi = formatPhoneForApi(phoneFilter);
      params.append('phone_number', phoneForApi);
    }
    if (statusFilter) params.append('status', statusFilter);
    if (codeFilter) params.append('code', codeFilter);
    if (utmFilter) params.append('utm', utmFilter);
    if (dateStartFilter) params.append('created_at__starts', dateStartFilter);
    if (dateEndFilter) params.append('created_end__starts', dateEndFilter);
    
    return `https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/leads?${params.toString()}`;
  };

  const loadLeads = async (page: number = currentPage) => {
    try {
      setLeadsLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await makeApiCall(buildLeadsUrl(), {
        method: 'GET'
      });

      if (response.ok) {
        const leadsData: LeadsResponse = await response.json();
        
        // Verificar se a resposta segue o padrão esperado
        if (leadsData && typeof leadsData === 'object' && 'items' in leadsData) {
          setLeads(leadsData.items || []);
          setCurrentPage(leadsData.page || 1);
          setHasNextPage(leadsData.hasNextPage || false);
          
          // Calcular total de páginas baseado na resposta
          if (leadsData.hasNextPage) {
            setTotalPages(leadsData.page + 1); // Pelo menos mais uma página
          } else {
            setTotalPages(leadsData.page); // Esta é a última página
          }
        } else {
          // Fallback para formato antigo (array direto)
          setLeads(Array.isArray(leadsData) ? leadsData : []);
          setHasNextPage(false);
          setTotalPages(1);
        }
      } else {
        throw new Error('Falha ao carregar leads');
      }
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      setError('Erro ao carregar leads');
      setLeads([]);
      setHasNextPage(false);
      setTotalPages(1);
    } finally {
      setLeadsLoading(false);
    }
  };

  const loadCampaigns = async (page: number = campaignCurrentPage) => {
    try {
      setCampaignsLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await makeApiCall(`https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/campaigns?page=${page}&limit=${limit}`, {
        method: 'GET'
      });

      if (response.ok) {
        const campaignsData: CampaignsResponse = await response.json();
        
        if (campaignsData && typeof campaignsData === 'object' && 'items' in campaignsData) {
          setCampaigns(campaignsData.items || []);
          setCampaignCurrentPage(campaignsData.page || 1);
          setCampaignHasNextPage(campaignsData.hasNextPage || false);
          
          if (campaignsData.hasNextPage) {
            setCampaignTotalPages(campaignsData.page + 1);
          } else {
            setCampaignTotalPages(campaignsData.page);
          }
        } else {
          setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
          setCampaignHasNextPage(false);
          setCampaignTotalPages(1);
        }
      } else {
        throw new Error('Falha ao carregar campanhas');
      }
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
      setError('Erro ao carregar campanhas');
      setCampaigns([]);
      setCampaignHasNextPage(false);
      setCampaignTotalPages(1);
    } finally {
      setCampaignsLoading(false);
    }
  };

  const loadSellers = async (page: number = sellerCurrentPage) => {
    try {
      setSellersLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await makeApiCall(`https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/sellers?page=${page}&limit=${limit}`, {
        method: 'GET'
      });

      if (response.ok) {
        const sellersData: SellersResponse = await response.json();
        
        if (sellersData && typeof sellersData === 'object' && 'items' in sellersData) {
          setSellers(sellersData.items || []);
          setSellerCurrentPage(sellersData.page || 1);
          setSellerHasNextPage(sellersData.hasNextPage || false);
          
          if (sellersData.hasNextPage) {
            setSellerTotalPages(sellersData.page + 1);
          } else {
            setSellerTotalPages(sellersData.page);
          }
        } else {
          setSellers(Array.isArray(sellersData) ? sellersData : []);
          setSellerHasNextPage(false);
          setSellerTotalPages(1);
        }
      } else {
        throw new Error('Falha ao carregar vendedores');
      }
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
      setError('Erro ao carregar vendedores');
      setSellers([]);
      setSellerHasNextPage(false);
      setSellerTotalPages(1);
    } finally {
      setSellersLoading(false);
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
      setError('Erro ao carregar planos');
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  };

  const loadLeadDetail = async (leadUuid: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await makeApiCall(`https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/leads/${leadUuid}`, {
        method: 'GET'
      });

      if (response.ok) {
        const leadDetail = await response.json();
        setSelectedLead(leadDetail);
        setLeadEditForm({
          name: leadDetail.name || '',
          phone_number: leadDetail.phone_number || '',
          status: leadDetail.status || '',
          rate: leadDetail.rate || 0
        });
        setShowLeadDetail(true);
      } else {
        throw new Error('Falha ao carregar detalhes do lead');
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do lead:', error);
    }
  };

  const handleEditLead = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token || !selectedLead) return;

      // Converter telefone para formato da API antes de enviar
      const leadDataToSend = {
        ...leadEditForm,
        phone_number: leadEditForm.phone_number ? formatPhoneForApi(leadEditForm.phone_number) : leadEditForm.phone_number
      };

      const response = await makeApiCall(`https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/leads/${selectedLead.uuid}`, {
        method: 'PATCH',
        body: JSON.stringify(leadDataToSend)
      });

      if (response.ok) {
        const updatedLead = await response.json();
        setSelectedLead(updatedLead);
        setIsEditingLead(false);
        // Recarregar a lista de leads
        loadLeads(currentPage);
      } else {
        throw new Error('Falha ao atualizar lead');
      }
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (changePasswordForm.new_password !== changePasswordForm.confirm_password) {
        alert('Nova senha e confirmação não coincidem');
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await makeApiCall('https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/change-password', {
        method: 'POST',
        body: JSON.stringify({
          password: changePasswordForm.password,
          new_password: changePasswordForm.new_password
        })
      });

      if (response.ok) {
        alert('Senha alterada com sucesso!');
        setShowChangePasswordModal(false);
        setChangePasswordForm({
          password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erro ao alterar senha');
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao alterar senha');
    }
  };

  const loadCampaignDetail = async (campaignUuid: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await makeApiCall(`https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/campaigns/${campaignUuid}`, {
        method: 'GET'
      });

      if (response.ok) {
        const campaignDetail = await response.json();
        setSelectedCampaign(campaignDetail);
        setCampaignForm({
          name: campaignDetail.name,
          phone: campaignDetail.phone,
          message: campaignDetail.message,
          link: campaignDetail.link,
          active: campaignDetail.active
        });
        setIsEditingCampaign(true);
        setShowCampaignModal(true);
      } else {
        throw new Error('Falha ao carregar detalhes da campanha');
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da campanha:', error);
    }
  };

  const loadSellerDetail = async (sellerUuid: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await makeApiCall(`https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/sellers/${sellerUuid}`, {
        method: 'GET'
      });

      if (response.ok) {
        const sellerDetail = await response.json();
        setSelectedSeller(sellerDetail);
        
        const formData = {
          name: sellerDetail.name,
          phone: sellerDetail.phone,
          message: sellerDetail.message,
          link: sellerDetail.link,
          email: sellerDetail.email,
          password: sellerDetail.password,
          active: sellerDetail.active
        };
        
        setSellerForm(formData);
        setOriginalSellerData(formData); // Armazenar dados originais para comparação
        setIsEditingSeller(true);
        setShowSellerModal(true);
      } else {
        throw new Error('Falha ao carregar detalhes do vendedor');
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do vendedor:', error);
    }
  };

  const handleCreateCampaign = () => {
    setCampaignForm({
      name: '',
      phone: '',
      message: '',
      link: 'https://api.whatsapp.com/send',
      active: true
    });
    setSelectedCampaign(null);
    setIsEditingCampaign(false);
    setShowCampaignModal(true);
  };

  const handleCreateSeller = () => {
    const formData = {
      name: '',
      phone: '',
      message: '',
      link: 'https://api.whatsapp.com/send',
      email: '',
      password: '',
      active: true
    };
    
    setSellerForm(formData);
    setOriginalSellerData(formData);
    setSelectedSeller(null);
    setIsEditingSeller(false);
    setShowSellerModal(true);
    setShowSellerPassword(false);
  };

  const handleSaveCampaign = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // Converter telefone para formato da API antes de enviar
      const campaignDataToSend = {
        ...campaignForm,
        phone: campaignForm.phone ? formatPhoneForApi(campaignForm.phone) : campaignForm.phone
      };

      const url = isEditingCampaign 
        ? `https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/campaigns/${selectedCampaign?.uuid}`
        : 'https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/campaigns';
      
      const method = isEditingCampaign ? 'PATCH' : 'POST';

      const response = await makeApiCall(url, {
        method,
        body: JSON.stringify(campaignDataToSend)
      });

      if (response.ok) {
        setShowCampaignModal(false);
        loadCampaigns(campaignCurrentPage);
      } else {
        throw new Error('Falha ao salvar campanha');
      }
    } catch (error) {
      console.error('Erro ao salvar campanha:', error);
    }
  };

  const handleSaveSeller = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      let sellerDataToSend: any = {};

      if (isEditingSeller) {
        // Para edição, enviar apenas campos alterados
        Object.keys(sellerForm).forEach(key => {
          const formKey = key as keyof typeof sellerForm;
          if (sellerForm[formKey] !== originalSellerData[formKey]) {
            if (formKey === 'phone' && sellerForm[formKey]) {
              sellerDataToSend[formKey] = formatPhoneForApi(sellerForm[formKey]);
            } else {
              sellerDataToSend[formKey] = sellerForm[formKey];
            }
          }
        });

        // Se nenhum campo foi alterado, não enviar nada
        if (Object.keys(sellerDataToSend).length === 0) {
          setShowSellerModal(false);
          return;
        }
      } else {
        // Para criação, enviar todos os campos
        sellerDataToSend = {
          ...sellerForm,
          phone: sellerForm.phone ? formatPhoneForApi(sellerForm.phone) : sellerForm.phone
        };
      }

      const url = isEditingSeller 
        ? `https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/sellers/${selectedSeller?.uuid}`
        : 'https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/sellers';
      
      const method = isEditingSeller ? 'PATCH' : 'POST';

      const response = await makeApiCall(url, {
        method,
        body: JSON.stringify(sellerDataToSend)
      });

      if (response.ok) {
        setShowSellerModal(false);
        setShowSellerPassword(false);
        loadSellers(sellerCurrentPage);
      } else {
        throw new Error('Falha ao salvar vendedor');
      }
    } catch (error) {
      console.error('Erro ao salvar vendedor:', error);
    }
  };

  const copyScriptUrl = (scriptUrl: string) => {
    navigator.clipboard.writeText(scriptUrl);
    // Aqui você pode adicionar uma notificação de sucesso
  };

  const generateScriptExample = (scriptUrl: string) => {
    return `<!-- Adicione este script no seu site -->
<script src="${scriptUrl}"></script>

<!-- Ou importe via JavaScript -->
<script>
  const script = document.createElement('script');
  script.src = '${scriptUrl}';
  document.head.appendChild(script);
</script>`;
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

  const handleCampaignPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= campaignTotalPages) {
      setCampaignCurrentPage(newPage);
    }
  };

  const handleCampaignNextPage = () => {
    if (campaignHasNextPage) {
      const newPage = campaignCurrentPage + 1;
      setCampaignCurrentPage(newPage);
      setCampaignTotalPages(Math.max(campaignTotalPages, newPage));
    }
  };

  const handleCampaignPrevPage = () => {
    if (campaignCurrentPage > 1) {
      setCampaignCurrentPage(campaignCurrentPage - 1);
    }
  };

  const handleSellerPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= sellerTotalPages) {
      setSellerCurrentPage(newPage);
    }
  };

  const handleSellerNextPage = () => {
    if (sellerHasNextPage) {
      const newPage = sellerCurrentPage + 1;
      setSellerCurrentPage(newPage);
      setSellerTotalPages(Math.max(sellerTotalPages, newPage));
    }
  };

  const handleSellerPrevPage = () => {
    if (sellerCurrentPage > 1) {
      setSellerCurrentPage(sellerCurrentPage - 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'clicked': return 'bg-green-100 text-green-800';
      case 'viewed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rate: number) => {
    const stars = [];
    const maxStars = 5;
    const filledStars = Math.min(Math.max(Math.round(rate), 0), maxStars);
    
    for (let i = 0; i < maxStars; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < filledStars 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
          }`}
        />
      );
    }
    
    return <div className="flex items-center space-x-1">{stars}</div>;
  };

  const renderStatusPipeline = (status: string) => {
    const stages = ['pending', 'viewed', 'clicked', 'converted'];
    const stageLabels = {
      pending: 'Pendente',
      viewed: 'Visualizado',
      clicked: 'Clicado',
      converted: 'Convertido'
    };
    
    const currentStageIndex = stages.indexOf(status.toLowerCase());
    
    return (
      <div className="flex items-center space-x-2">
        {stages.map((stage, index) => {
          const isActive = index <= currentStageIndex;
          const isCurrent = index === currentStageIndex;
          
          return (
            <div key={stage} className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  isActive
                    ? isCurrent
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-green-500 border-green-500'
                    : 'bg-gray-200 border-gray-300'
                }`}
              />
              {index < stages.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${
                    isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {stageLabels[status.toLowerCase() as keyof typeof stageLabels] || status}
        </span>
      </div>
    );
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

  const filteredLeads = leads.filter(lead =>
    (lead.content?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (lead.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (lead.code?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (lead.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSellers = sellers.filter(seller =>
    seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p className="text-gray-600">Carregando dashboard...</p>
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
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">LeaDrive</h1>
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
                    onClick={() => router.push('/account')}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Minha conta
                  </button>
                  <button 
                    onClick={() => setShowChangePasswordModal(true)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Lock className="w-4 h-4 mr-3" />
                    Alterar senha
                  </button>
                  <button 
                    onClick={() => router.push('/payments')}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <CreditCard className="w-4 h-4 mr-3" />
                    Pagamentos
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

      {/* Trial Warning Banner - Moved below header */}
      {user?.is_trial && user?.next_payment && (
        <div className="bg-orange-100 border-b border-orange-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => router.push('/payments')}
              className="w-full py-3 flex items-center justify-center space-x-2 hover:bg-orange-200 transition-colors"
            >
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="text-orange-800 font-medium">
                Seu trial se encerra em {calculateDaysUntilPayment(user.next_payment)} dias - Clique aqui para escolher um plano
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Bem-vindo de volta, {user?.name}! Aqui está um resumo dos seus leads.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Acessos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    dashboardStats.total_hists.toLocaleString('pt-BR')
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MousePointer className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Clicados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    dashboardStats.total_leads.toLocaleString('pt-BR')
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    `${dashboardStats.percent_leads}%`
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    dashboardStats.totat_linked.toLocaleString('pt-BR')
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['leads', 'campanhas', 'vendedores', 'planos'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {activeTab === 'leads' && (
              <div>
                {/* Search and Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros
                    </button>
                    <button 
                      onClick={() => {
                        loadLeads(currentPage);
                        loadDashboardStats();
                      }}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      disabled={leadsLoading || statsLoading}
                    >
                      {(leadsLoading || statsLoading) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Settings className="w-4 h-4 mr-2" />
                      )}
                      Atualizar
                    </button>
                  </div>
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por telefone</label>
                      <input
                        type="text"
                        placeholder="Digite o telefone..."
                        value={phoneFilter}
                        onChange={(e) => setPhoneFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Todos os status</option>
                        <option value="pending">Pending</option>
                        <option value="viewed">Viewed</option>
                        <option value="clicked">Clicked</option>
                        <option value="converted">Converted</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por código</label>
                      <input
                        type="text"
                        placeholder="Digite o código..."
                        value={codeFilter}
                        onChange={(e) => setCodeFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por UTM</label>
                      <input
                        type="text"
                        placeholder="Digite o valor UTM..."
                        value={utmFilter}
                        onChange={(e) => setUtmFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data início</label>
                      <input
                        type="date"
                        value={dateStartFilter}
                        onChange={(e) => setDateStartFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data fim</label>
                      <input
                        type="date"
                        value={dateEndFilter}
                        onChange={(e) => setDateEndFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Leads List */}
                {leadsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando leads...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4">
                      {filteredLeads.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                          <p className="text-gray-500">Nenhum lead encontrado</p>
                        </div>
                      ) : (
                        filteredLeads.map((lead) => {
                          const utmTags = getUtmTags(lead.queryStringParameters);
                          
                          return (
                            <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                 onClick={() => loadLeadDetail(lead.uuid)}>
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate">
                                      {lead.name ? `${lead.name} - ${lead.phone_number ? formatPhoneForDisplay(lead.phone_number) : 'Sem telefone'}` : `${lead.code} - ${lead.phone_number ? formatPhoneForDisplay(lead.phone_number) : 'Sem telefone'}`}
                                    </h3>
                                    <p className="text-sm text-gray-600 truncate">
                                      {lead.location?.city}, {lead.location?.region} - {lead.location?.country}
                                    </p>
                                    {lead.phone_number && (
                                      <p className="text-sm text-gray-600 flex items-center mt-1">
                                        <Phone className="w-3 h-3 mr-1" />
                                        {formatPhoneForDisplay(lead.phone_number)}
                                      </p>
                                    )}
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)} flex-shrink-0`}>
                                    {lead.status}
                                  </span>
                                </div>
                                
                                {/* UTM Tags */}
                                {utmTags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {utmTags.slice(0, 3).map((tag, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                                      >
                                        {tag.key}: {tag.value}
                                      </span>
                                    ))}
                                    {utmTags.length > 3 && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                        +{utmTags.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center space-x-3">
                                    <span>Rate: {lead.rate}</span>
                                    <span className="flex items-center">
                                      <Eye className="w-3 h-3 mr-1" />
                                      {lead.access?.length || 0}
                                    </span>
                                  </div>
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {formatDate(lead.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Pagination */}
                    {(totalPages > 1 || hasNextPage) && (
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Página {currentPage} {totalPages > 1 && `de ${totalPages}`}</span>
                          <span className="ml-4">{filteredLeads.length} leads exibidos</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Anterior
                          </button>
                          
                          {/* Page numbers */}
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
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'campanhas' && (
              <div>
                {/* Search and Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar campanhas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros
                    </button>
                    <button 
                      onClick={() => loadCampaigns(campaignCurrentPage)}
                      className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      disabled={campaignsLoading}
                    >
                      {campaignsLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      ) : (
                        <Settings className="w-4 h-4 mr-2" />
                      )}
                      Atualizar
                    </button>
                    <button 
                      onClick={handleCreateCampaign}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Campanha
                    </button>
                  </div>
                </div>

                {/* Campaigns List */}
                {campaignsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando campanhas...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4">
                      {filteredCampaigns.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                          <p className="text-gray-500">Nenhuma campanha encontrada</p>
                        </div>
                      ) : (
                        filteredCampaigns.map((campaign) => (
                          <div key={campaign.uuid} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-gray-900 truncate">{campaign.name}</h3>
                                  <p className="text-sm text-gray-600 truncate">
                                    {formatPhoneForDisplay(campaign.phone)}
                                  </p>
                                  <p className="text-sm text-gray-600 truncate mt-1">
                                    {campaign.message.substring(0, 50)}...
                                  </p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                  campaign.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {campaign.active ? 'Ativa' : 'Inativa'}
                                </span>
                              </div>
                              
                              {/* Script Example Block */}
                              <div className="bg-gray-900 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <Code className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-300">Como usar este script:</span>
                                  </div>
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(generateScriptExample(campaign.script))}
                                    className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                                  >
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copiar
                                  </button>
                                </div>
                                <pre className="text-xs text-gray-300 overflow-x-auto">
                                  <code>{generateScriptExample(campaign.script)}</code>
                                </pre>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(campaign.created_at)}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => copyScriptUrl(campaign.script)}
                                    className="flex items-center text-blue-600 hover:text-blue-800"
                                  >
                                    <Copy className="w-3 h-3 mr-1" />
                                    URL do Script
                                  </button>
                                  <button 
                                    onClick={() => loadCampaignDetail(campaign.uuid)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Campaign Pagination */}
                    {(campaignTotalPages > 1 || campaignHasNextPage) && (
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Página {campaignCurrentPage} {campaignTotalPages > 1 && `de ${campaignTotalPages}`}</span>
                          <span className="ml-4">{filteredCampaigns.length} campanhas exibidas</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleCampaignPrevPage}
                            disabled={campaignCurrentPage === 1}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Anterior
                          </button>
                          
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, campaignTotalPages) }, (_, i) => {
                              const pageNum = Math.max(1, campaignCurrentPage - 2) + i;
                              if (pageNum > campaignTotalPages) return null;
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handleCampaignPageChange(pageNum)}
                                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                    pageNum === campaignCurrentPage
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
                            onClick={handleCampaignNextPage}
                            disabled={!campaignHasNextPage}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Próxima
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'vendedores' && (
              <div>
                {/* Search and Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar vendedores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros
                    </button>
                    <button 
                      onClick={() => loadSellers(sellerCurrentPage)}
                      className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      disabled={sellersLoading}
                    >
                      {sellersLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      ) : (
                        <Settings className="w-4 h-4 mr-2" />
                      )}
                      Atualizar
                    </button>
                    <button 
                      onClick={handleCreateSeller}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Vendedor
                    </button>
                  </div>
                </div>

                {/* Sellers List */}
                {sellersLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando vendedores...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4">
                      {filteredSellers.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                          <p className="text-gray-500">Nenhum vendedor encontrado</p>
                        </div>
                      ) : (
                        filteredSellers.map((seller) => (
                          <div key={seller.uuid} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-gray-900 truncate">{seller.name}</h3>
                                  <p className="text-sm text-gray-600 truncate">
                                    {seller.email}
                                  </p>
                                  <p className="text-sm text-gray-600 truncate">
                                    {formatPhoneForDisplay(seller.phone)}
                                  </p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                  seller.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {seller.active ? 'Ativo' : 'Inativo'}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(seller.created_at)}
                                </span>
                                <button 
                                  onClick={() => loadSellerDetail(seller.uuid)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Seller Pagination */}
                    {(sellerTotalPages > 1 || sellerHasNextPage) && (
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Página {sellerCurrentPage} {sellerTotalPages > 1 && `de ${sellerTotalPages}`}</span>
                          <span className="ml-4">{filteredSellers.length} vendedores exibidos</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleSellerPrevPage}
                            disabled={sellerCurrentPage === 1}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Anterior
                          </button>
                          
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, sellerTotalPages) }, (_, i) => {
                              const pageNum = Math.max(1, sellerCurrentPage - 2) + i;
                              if (pageNum > sellerTotalPages) return null;
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handleSellerPageChange(pageNum)}
                                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                    pageNum === sellerCurrentPage
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
                            onClick={handleSellerNextPage}
                            disabled={!sellerHasNextPage}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Próxima
                            <ChevronRight className="w-4 h-4 ml-1" />
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
                        <div key={plan.key} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                          <div className="space-y-4">
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
                              onClick={() => router.push('/payments')}
                              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                                plan.key === 'trial' 
                                  ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
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

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Alterar Senha</h2>
                <button
                  onClick={() => setShowChangePasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                <input
                  type="password"
                  value={changePasswordForm.password}
                  onChange={(e) => setChangePasswordForm({...changePasswordForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite sua senha atual"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                <input
                  type="password"
                  value={changePasswordForm.new_password}
                  onChange={(e) => setChangePasswordForm({...changePasswordForm, new_password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite sua nova senha"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={changePasswordForm.confirm_password}
                  onChange={(e) => setChangePasswordForm({...changePasswordForm, confirm_password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirme sua nova senha"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Alterar Senha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
                </h2>
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Campanha</label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Campanha Site I"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={campaignForm.phone}
                  onChange={(e) => setCampaignForm({...campaignForm, phone: applyPhoneMask(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+55 (16) 99349-1807"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea
                  value={campaignForm.message}
                  onChange={(e) => setCampaignForm({...campaignForm, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Ex: Que bom que gostou, entre em contato"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                <input
                  type="text"
                  value={campaignForm.link}
                  onChange={(e) => setCampaignForm({...campaignForm, link: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://api.whatsapp.com/send"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={campaignForm.active}
                  onChange={(e) => setCampaignForm({...campaignForm, active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                  Campanha ativa
                </label>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCampaignModal(false)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCampaign}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isEditingCampaign ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seller Modal - Responsivo e com visualização de senha */}
      {showSellerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {isEditingSeller ? 'Editar Vendedor' : 'Novo Vendedor'}
                </h2>
                <button
                  onClick={() => {
                    setShowSellerModal(false);
                    setShowSellerPassword(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={sellerForm.name}
                    onChange={(e) => setSellerForm({...sellerForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Ex: João Silva"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={sellerForm.email}
                    onChange={(e) => setSellerForm({...sellerForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Ex: joao@email.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={sellerForm.phone}
                    onChange={(e) => setSellerForm({...sellerForm, phone: applyPhoneMask(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="+55 (16) 99349-1807"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <div className="relative">
                    <input
                      type={showSellerPassword ? "text" : "password"}
                      value={sellerForm.password}
                      onChange={(e) => setSellerForm({...sellerForm, password: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Digite a senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSellerPassword(!showSellerPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showSellerPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea
                  value={sellerForm.message}
                  onChange={(e) => setSellerForm({...sellerForm, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={3}
                  placeholder="Ex: Que bom que gostou, entre em contato"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                <input
                  type="text"
                  value={sellerForm.link}
                  onChange={(e) => setSellerForm({...sellerForm, link: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="https://api.whatsapp.com/send"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sellerActive"
                  checked={sellerForm.active}
                  onChange={(e) => setSellerForm({...sellerForm, active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="sellerActive" className="ml-2 block text-sm text-gray-900">
                  Vendedor ativo
                </label>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setShowSellerModal(false);
                  setShowSellerPassword(false);
                }}
                className="w-full sm:w-auto px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSeller}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                {isEditingSeller ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {showLeadDetail && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Detalhes do Lead - {selectedLead.code}
                </h2>
                <div className="flex items-center space-x-2">
                  {!isEditingLead ? (
                    <button
                      onClick={() => setIsEditingLead(true)}
                      className="flex items-center px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleEditLead}
                        className="flex items-center px-3 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </button>
                      <button
                        onClick={() => setIsEditingLead(false)}
                        className="flex items-center px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setShowLeadDetail(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Lead Info - 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Gerais</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Código</label>
                      <p className="text-gray-900">{selectedLead.code}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nome</label>
                      {isEditingLead ? (
                        <input
                          type="text"
                          value={leadEditForm.name}
                          onChange={(e) => setLeadEditForm({...leadEditForm, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nome do lead"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedLead.name || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Telefone</label>
                      {isEditingLead ? (
                        <input
                          type="text"
                          value={leadEditForm.phone_number}
                          onChange={(e) => setLeadEditForm({...leadEditForm, phone_number: applyPhoneMask(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+55 (16) 99349-1807"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedLead.phone_number ? formatPhoneForDisplay(selectedLead.phone_number) : '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedLead.email || '-'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      {isEditingLead ? (
                        <select
                          value={leadEditForm.status}
                          onChange={(e) => setLeadEditForm({...leadEditForm, status: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="viewed">Viewed</option>
                          <option value="clicked">Clicked</option>
                          <option value="converted">Converted</option>
                        </select>
                      ) : (
                        <div className="mt-2">
                          {renderStatusPipeline(selectedLead.status)}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Rate</label>
                      {isEditingLead ? (
                        <input
                          type="number"
                          value={leadEditForm.rate}
                          onChange={(e) => setLeadEditForm({...leadEditForm, rate: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Rate do lead"
                        />
                      ) : (
                        <div className="mt-2">
                          {renderStars(selectedLead.rate)}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Criado em</label>
                      <p className="text-gray-900">{formatDate(selectedLead.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Atualizado em</label>
                      <p className="text-gray-900">{formatDate(selectedLead.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Info - moved up */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Campanha</h3>
                <div className="space-y-4">
                  {selectedLead.content && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Nome da Campanha</label>
                        <p className="text-gray-900">{selectedLead.content.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Telefone da Campanha</label>
                        <p className="text-gray-900">{formatPhoneForDisplay(selectedLead.content.phone)}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Query String Parameters Table */}
                  {selectedLead.queryStringParameters && Object.keys(selectedLead.queryStringParameters).length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Parâmetros da URL</label>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Parâmetro
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Object.entries(selectedLead.queryStringParameters).map(([key, value]) => (
                              <tr key={key}>
                                <td className="px-4 py-2 text-sm font-medium text-gray-900">{key}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{String(value)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Access History - Table format */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Histórico de Acessos</h3>
                {selectedLead.access && selectedLead.access.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Página
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data/Hora
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedLead.access.map((access, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {access.page || 'Acesso direto'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {new Date(access.createdAt).toLocaleString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhum acesso registrado</p>
                )}
              </div>

              {/* Device Info - Table format */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Dispositivo</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Propriedade
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">País</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{selectedLead.location?.country || '-'}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">Cidade</td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {selectedLead.location?.city && selectedLead.location?.region 
                            ? `${selectedLead.location.city}, ${selectedLead.location.region}` 
                            : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">IP</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{selectedLead.clientIp || '-'}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">ISP</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{selectedLead.location?.isp || '-'}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">Dispositivo</td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {selectedLead.agent?.device?.vendor && selectedLead.agent?.device?.model
                            ? `${selectedLead.agent.device.vendor} ${selectedLead.agent.device.model}`
                            : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">Sistema Operacional</td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {selectedLead.agent?.os?.name && selectedLead.agent?.os?.version
                            ? `${selectedLead.agent.os.name} ${selectedLead.agent.os.version}`
                            : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">Navegador</td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {selectedLead.agent?.browser?.name && selectedLead.agent?.browser?.version
                            ? `${selectedLead.agent.browser.name} ${selectedLead.agent.browser.version}`
                            : '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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