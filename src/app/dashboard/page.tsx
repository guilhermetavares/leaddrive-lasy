'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, ChevronDown, Settings, CreditCard, LogOut, Search, Filter, Users, TrendingUp, MousePointer, DollarSign, MapPin, Smartphone, Globe, Calendar, Eye, ExternalLink, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Copy, Mail, Phone } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
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

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadDetail | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [sellersLoading, setSellersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLeadDetail, setShowLeadDetail] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [isEditingCampaign, setIsEditingCampaign] = useState(false);
  const [isEditingSeller, setIsEditingSeller] = useState(false);
  
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
  
  const router = useRouter();

  useEffect(() => {
    loadUserData();
    loadLeads();
  }, []);

  useEffect(() => {
    loadLeads();
  }, [currentPage]);

  useEffect(() => {
    if (activeTab === 'campanhas') {
      loadCampaigns();
    } else if (activeTab === 'vendedores') {
      loadSellers();
    }
  }, [activeTab, campaignCurrentPage, sellerCurrentPage]);

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

  const loadLeads = async (page: number = currentPage) => {
    try {
      setLeadsLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch(`https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/leads?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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

      const response = await fetch(`https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/campaigns?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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

      const response = await fetch(`https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/sellers?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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

  const loadLeadDetail = async (leadUuid: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/leads/${leadUuid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const leadDetail = await response.json();
        setSelectedLead(leadDetail);
        setShowLeadDetail(true);
      } else {
        throw new Error('Falha ao carregar detalhes do lead');
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do lead:', error);
    }
  };

  const loadCampaignDetail = async (campaignUuid: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/campaigns/${campaignUuid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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

      const response = await fetch(`https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/sellers/${sellerUuid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const sellerDetail = await response.json();
        setSelectedSeller(sellerDetail);
        setSellerForm({
          name: sellerDetail.name,
          phone: sellerDetail.phone,
          message: sellerDetail.message,
          link: sellerDetail.link,
          email: sellerDetail.email,
          password: sellerDetail.password,
          active: sellerDetail.active
        });
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
    setSellerForm({
      name: '',
      phone: '',
      message: '',
      link: 'https://api.whatsapp.com/send',
      email: '',
      password: '',
      active: true
    });
    setSelectedSeller(null);
    setIsEditingSeller(false);
    setShowSellerModal(true);
  };

  const handleSaveCampaign = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const url = isEditingCampaign 
        ? `https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/campaigns/${selectedCampaign?.uuid}`
        : 'https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/campaigns';
      
      const method = isEditingCampaign ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignForm)
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

      const url = isEditingSeller 
        ? `https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/sellers/${selectedSeller?.uuid}`
        : 'https://y3c7214nh2.execute-api.us-east-1.amazonaws.com/sellers';
      
      const method = isEditingSeller ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sellerForm)
      });

      if (response.ok) {
        setShowSellerModal(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const stats = {
    totalLeads: leads.length,
    clickedLeads: leads.filter(l => l.status === 'clicked').length,
    totalAccesses: leads.reduce((acc, lead) => acc + (lead.access?.length || 0), 0),
    conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'clicked').length / leads.length) * 100) : 0
  };

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
              <h1 className="text-xl font-semibold text-gray-900">LeadManager</h1>
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
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    <User className="w-4 h-4 mr-3" />
                    Minha conta
                  </button>
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
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
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MousePointer className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Leads Clicados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.clickedLeads}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Acessos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAccesses}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['leads', 'campanhas', 'vendedores'].map((tab) => (
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
                    <button className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros
                    </button>
                    <button 
                      onClick={() => loadLeads(currentPage)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      disabled={leadsLoading}
                    >
                      {leadsLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Settings className="w-4 h-4 mr-2" />
                      )}
                      Atualizar
                    </button>
                  </div>
                </div>

                {/* Leads List */}
                {leadsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando leads...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {filteredLeads.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500">Nenhum lead encontrado</p>
                        </div>
                      ) : (
                        filteredLeads.map((lead) => (
                          <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                               onClick={() => loadLeadDetail(lead.uuid)}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <h3 className="font-medium text-gray-900">
                                      {lead.name || lead.content?.name || `Lead ${lead.code}`}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      {lead.location?.city}, {lead.location?.region} - {lead.location?.country}
                                    </p>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                                    {lead.status}
                                  </span>
                                </div>
                                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                  <span>Rate: {lead.rate}</span>
                                  <span>•</span>
                                  <span>Código: {lead.code}</span>
                                  <span>•</span>
                                  {lead.phone_number && (
                                    <>
                                      <span>Tel: {lead.phone_number}</span>
                                      <span>•</span>
                                    </>
                                  )}
                                  {lead.email && (
                                    <>
                                      <span>Email: {lead.email}</span>
                                      <span>•</span>
                                    </>
                                  )}
                                  <span className="flex items-center">
                                    <Eye className="w-3 h-3 mr-1" />
                                    {lead.access?.length || 0} acessos
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {formatDate(lead.created_at)}
                                  </span>
                                </div>
                              </div>
                              <button className="text-gray-400 hover:text-gray-600">
                                <ExternalLink className="w-5 h-5" />
                              </button>
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
                    <div className="space-y-4">
                      {filteredCampaigns.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500">Nenhuma campanha encontrada</p>
                        </div>
                      ) : (
                        filteredCampaigns.map((campaign) => (
                          <div key={campaign.uuid} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                                    <p className="text-sm text-gray-600">
                                      {campaign.phone} • {campaign.message.substring(0, 50)}...
                                    </p>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    campaign.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {campaign.active ? 'Ativa' : 'Inativa'}
                                  </span>
                                </div>
                                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {formatDate(campaign.created_at)}
                                  </span>
                                  <span>•</span>
                                  <button 
                                    onClick={() => copyScriptUrl(campaign.script)}
                                    className="flex items-center text-blue-600 hover:text-blue-800"
                                  >
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copiar Script
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => loadCampaignDetail(campaign.uuid)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
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
                    <div className="space-y-4">
                      {filteredSellers.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500">Nenhum vendedor encontrado</p>
                        </div>
                      ) : (
                        filteredSellers.map((seller) => (
                          <div key={seller.uuid} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <h3 className="font-medium text-gray-900">{seller.name}</h3>
                                    <p className="text-sm text-gray-600">
                                      {seller.email} • {seller.phone}
                                    </p>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    seller.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {seller.active ? 'Ativo' : 'Inativo'}
                                  </span>
                                </div>
                                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                  <span className="flex items-center">
                                    <Mail className="w-3 h-3 mr-1" />
                                    {seller.email}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {seller.phone}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {formatDate(seller.created_at)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => loadSellerDetail(seller.uuid)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <Edit className="w-5 h-5" />
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
          </div>
        </div>
      </main>

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
                  onChange={(e) => setCampaignForm({...campaignForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: +5516993491807"
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

      {/* Seller Modal */}
      {showSellerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditingSeller ? 'Editar Vendedor' : 'Novo Vendedor'}
                </h2>
                <button
                  onClick={() => setShowSellerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={sellerForm.name}
                  onChange={(e) => setSellerForm({...sellerForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: João Silva"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={sellerForm.email}
                  onChange={(e) => setSellerForm({...sellerForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: joao@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={sellerForm.phone}
                  onChange={(e) => setSellerForm({...sellerForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: +5516993491807"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input
                  type="password"
                  value={sellerForm.password}
                  onChange={(e) => setSellerForm({...sellerForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite a senha"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea
                  value={sellerForm.message}
                  onChange={(e) => setSellerForm({...sellerForm, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowSellerModal(false)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSeller}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                  Detalhes do Lead - {selectedLead.name || selectedLead.content?.name || selectedLead.code}
                </h2>
                <button
                  onClick={() => setShowLeadDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Lead Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Gerais</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">ID</label>
                      <p className="text-gray-900">{selectedLead.code}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Rate</label>
                      <p className="text-gray-900">{selectedLead.rate}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Código</label>
                      <p className="text-gray-900">{selectedLead.code}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nome</label>
                      <p className="text-gray-900">{selectedLead.name || selectedLead.content?.name || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Telefone</label>
                      <p className="text-gray-900">{selectedLead.phone_number || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedLead.email || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLead.status)}`}>
                        {selectedLead.status}
                      </span>
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

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Dispositivo</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">País</label>
                      <p className="text-gray-900">{selectedLead.location?.country}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Cidade</label>
                      <p className="text-gray-900">{selectedLead.location?.city}, {selectedLead.location?.region}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">IP</label>
                      <p className="text-gray-900">{selectedLead.clientIp}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">ISP</label>
                      <p className="text-gray-900">{selectedLead.location?.isp}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Dispositivo</label>
                      <p className="text-gray-900">{selectedLead.agent?.device?.vendor} {selectedLead.agent?.device?.model}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Sistema Operacional</label>
                      <p className="text-gray-900">{selectedLead.agent?.os?.name} {selectedLead.agent?.os?.version}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Navegador</label>
                      <p className="text-gray-900">{selectedLead.agent?.browser?.name} {selectedLead.agent?.browser?.version}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access History */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Histórico de Acessos</h3>
                <div className="space-y-2">
                  {selectedLead.access?.map((access, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {access.page ? `Página: ${access.page}` : 'Acesso direto'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(access.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">Nenhum acesso registrado</p>
                  )}
                </div>
              </div>

              {/* Campaign Info */}
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
                        <p className="text-gray-900">{selectedLead.content.phone}</p>
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