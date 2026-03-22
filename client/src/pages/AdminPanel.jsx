import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  CalendarDays,
  Download,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  PlusCircle,
  RefreshCw,
  Search,
  Trash2,
  UserRound
} from 'lucide-react';
import { api, buildAuthHeaders, getApiErrorMessage } from '../lib/api';
import {
  clearAdminSession,
  getAdminToken,
  getStoredAdmin
} from '../utils/adminAuth';
import {
  ENQUIRY_STATUS_OPTIONS,
  formatDateOnly,
  formatDateTime,
  getEnquiryStatusClasses,
  getEnquiryStatusLabel,
  normalizeEnquiryStatus
} from '../utils/enquiries';
import {
  buildPackagePayload,
  createEmptyPackageForm,
  createPackageSlug,
  mapPackageToForm,
  normalizePackageForClient
} from '../utils/packages';
import PackageFormPanel from '../components/admin/PackageFormPanel';
import { SITE_NAME } from '../constants/site';

const ENQUIRY_STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  ...ENQUIRY_STATUS_OPTIONS
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const token = getAdminToken();
  const admin = getStoredAdmin();

  const [activeTab, setActiveTab] = useState('enquiries');
  const [enquiries, setEnquiries] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('all');
  const [statusUpdatingId, setStatusUpdatingId] = useState('');
  const [deletingEnquiryId, setDeletingEnquiryId] = useState('');

  const [packageDeletingId, setPackageDeletingId] = useState('');
  const [packageSaving, setPackageSaving] = useState(false);
  const [packageFormError, setPackageFormError] = useState('');
  const [packageSearch, setPackageSearch] = useState('');
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false);
  const [packageFormMode, setPackageFormMode] = useState('create');
  const [editingPackageId, setEditingPackageId] = useState('');
  const [packageForm, setPackageForm] = useState(createEmptyPackageForm());

  const enquiryStats = useMemo(() => {
    const normalizedStatuses = enquiries.map((enquiry) =>
      normalizeEnquiryStatus(enquiry.status)
    );

    return {
      total: enquiries.length,
      newCount: normalizedStatuses.filter((status) => status === 'new').length,
      contactedCount: normalizedStatuses.filter((status) => status === 'contacted')
        .length,
      closedCount: normalizedStatuses.filter((status) => status === 'closed').length
    };
  }, [enquiries]);

  const packageStats = useMemo(() => {
    return {
      total: packages.length,
      featuredCount: packages.filter((pkg) => pkg.isFeatured).length,
      activeCount: packages.filter((pkg) => pkg.isActive).length
    };
  }, [packages]);

  const filteredEnquiries = useMemo(() => {
    const query = enquirySearch.trim().toLowerCase();

    return enquiries.filter((enquiry) => {
      const normalizedStatus = normalizeEnquiryStatus(enquiry.status);
      const matchesStatus =
        enquiryStatusFilter === 'all' || normalizedStatus === enquiryStatusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        enquiry.name,
        enquiry.phone,
        enquiry.email,
        enquiry.package,
        enquiry.destination,
        enquiry.message
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [enquiries, enquirySearch, enquiryStatusFilter]);

  const filteredPackages = useMemo(() => {
    const query = packageSearch.trim().toLowerCase();

    if (!query) {
      return packages;
    }

    return packages.filter((pkg) =>
      [
        pkg.title,
        pkg.slug,
        pkg.location,
        pkg.category,
        pkg.description,
        pkg.overview,
        ...(pkg.inclusions || []),
        ...(pkg.exclusions || []),
        ...(pkg.pricingNotes || []),
        ...(pkg.itinerary || []).flatMap((item) => [item.title, item.details])
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [packageSearch, packages]);

  const hasEnquiryFilters = Boolean(
    enquirySearch.trim() || enquiryStatusFilter !== 'all'
  );

  const hasPackageSearch = Boolean(packageSearch.trim());

  const handleUnauthorized = () => {
    clearAdminSession();
    navigate('/admin/login', { replace: true });
  };

  const loadDashboard = async () => {
    if (!token) {
      handleUnauthorized();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [enquiriesResponse, packagesResponse] = await Promise.all([
        api.get('/api/enquiries', {
          headers: buildAuthHeaders(token)
        }),
        api.get('/api/packages/admin/all', {
          headers: buildAuthHeaders(token)
        })
      ]);

      setEnquiries(Array.isArray(enquiriesResponse.data) ? enquiriesResponse.data : []);
      setPackages(
        Array.isArray(packagesResponse.data)
          ? packagesResponse.data.map(normalizePackageForClient)
          : []
      );
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      setError(getApiErrorMessage(err, 'Unable to load admin dashboard.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin/login', { replace: true });
  };

  const handleStatusChange = async (enquiryId, status) => {
    try {
      setStatusUpdatingId(enquiryId);

      const response = await api.patch(
        `/api/enquiries/${enquiryId}/status`,
        { status },
        { headers: buildAuthHeaders(token) }
      );

      setEnquiries((currentEnquiries) =>
        currentEnquiries.map((enquiry) =>
          enquiry._id === enquiryId ? response.data : enquiry
        )
      );
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      setError(getApiErrorMessage(err, 'Unable to update enquiry status.'));
    } finally {
      setStatusUpdatingId('');
    }
  };

  const handleDeleteEnquiry = async (enquiryId) => {
    if (!window.confirm('Delete this enquiry permanently?')) {
      return;
    }

    try {
      setDeletingEnquiryId(enquiryId);

      await api.delete(`/api/enquiries/${enquiryId}`, {
        headers: buildAuthHeaders(token)
      });

      setEnquiries((currentEnquiries) =>
        currentEnquiries.filter((enquiry) => enquiry._id !== enquiryId)
      );
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      setError(getApiErrorMessage(err, 'Unable to delete enquiry.'));
    } finally {
      setDeletingEnquiryId('');
    }
  };

  const handleExportEnquiries = () => {
    if (!filteredEnquiries.length) {
      return;
    }

    const csvRows = [
      [
        'Name',
        'Phone',
        'Email',
        'Travel Date',
        'Package / Destination',
        'Message',
        'Status',
        'Created Time'
      ],
      ...filteredEnquiries.map((enquiry) => [
        enquiry.name,
        enquiry.phone,
        enquiry.email,
        formatDateOnly(enquiry.travelDate),
        enquiry.package || enquiry.destination || 'Custom enquiry',
        enquiry.message || '',
        getEnquiryStatusLabel(enquiry.status),
        formatDateTime(enquiry.createdAt)
      ])
    ];

    const csvContent = csvRows
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;'
    });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const openCreatePackageForm = () => {
    setPackageFormMode('create');
    setEditingPackageId('');
    setPackageForm(createEmptyPackageForm());
    setPackageFormError('');
    setIsPackageFormOpen(true);
    setActiveTab('packages');
  };

  const openEditPackageForm = (pkg) => {
    setPackageFormMode('edit');
    setEditingPackageId(pkg._id);
    setPackageForm(mapPackageToForm(pkg));
    setPackageFormError('');
    setIsPackageFormOpen(true);
    setActiveTab('packages');
  };

  const closePackageForm = () => {
    setIsPackageFormOpen(false);
    setPackageFormMode('create');
    setEditingPackageId('');
    setPackageFormError('');
    setPackageForm(createEmptyPackageForm());
  };

  const handlePackageFieldChange = (field, value) => {
    setPackageForm((currentValue) => ({
      ...currentValue,
      [field]: value
    }));
  };

  const handlePackageToggleChange = (field, value) => {
    setPackageForm((currentValue) => ({
      ...currentValue,
      [field]: value
    }));
  };

  const handleGenerateSlug = () => {
    setPackageForm((currentValue) => ({
      ...currentValue,
      slug: createPackageSlug(currentValue.title)
    }));
  };

  const handlePackageListChange = (field, index, value) => {
    setPackageForm((currentValue) => ({
      ...currentValue,
      [field]: currentValue[field].map((item, itemIndex) =>
        itemIndex === index ? value : item
      )
    }));
  };

  const handlePackageListAdd = (field) => {
    setPackageForm((currentValue) => ({
      ...currentValue,
      [field]: [...currentValue[field], '']
    }));
  };

  const handlePackageListRemove = (field, index) => {
    setPackageForm((currentValue) => ({
      ...currentValue,
      [field]:
        currentValue[field].length === 1
          ? ['']
          : currentValue[field].filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const handleItineraryChange = (index, field, value) => {
    setPackageForm((currentValue) => ({
      ...currentValue,
      itinerary: currentValue.itinerary.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    }));
  };

  const handleItineraryAdd = () => {
    setPackageForm((currentValue) => ({
      ...currentValue,
      itinerary: [
        ...currentValue.itinerary,
        {
          day: String(currentValue.itinerary.length + 1),
          title: '',
          details: ''
        }
      ]
    }));
  };

  const handleItineraryRemove = (index) => {
    setPackageForm((currentValue) => ({
      ...currentValue,
      itinerary:
        currentValue.itinerary.length === 1
          ? [{ day: '1', title: '', details: '' }]
          : currentValue.itinerary.filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const handlePackageSubmit = async (event) => {
    event.preventDefault();
    setPackageSaving(true);
    setPackageFormError('');

    try {
      const payload = buildPackagePayload(packageForm);

      const response =
        packageFormMode === 'create'
          ? await api.post('/api/packages', payload, {
              headers: buildAuthHeaders(token)
            })
          : await api.put(`/api/packages/${editingPackageId}`, payload, {
              headers: buildAuthHeaders(token)
            });

      const savedPackage = normalizePackageForClient(response.data);

      setPackages((currentPackages) => {
        if (packageFormMode === 'create') {
          return [savedPackage, ...currentPackages];
        }

        return currentPackages.map((pkg) =>
          pkg._id === savedPackage._id ? savedPackage : pkg
        );
      });

      closePackageForm();
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      setPackageFormError(getApiErrorMessage(err, 'Unable to save package details.'));
    } finally {
      setPackageSaving(false);
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (!window.confirm('Delete this package permanently?')) {
      return;
    }

    try {
      setPackageDeletingId(packageId);

      await api.delete(`/api/packages/${packageId}`, {
        headers: buildAuthHeaders(token)
      });

      setPackages((currentPackages) =>
        currentPackages.filter((pkg) => pkg._id !== packageId)
      );

      if (editingPackageId === packageId) {
        closePackageForm();
      }
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      setError(getApiErrorMessage(err, 'Unable to delete package.'));
    } finally {
      setPackageDeletingId('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
              Admin Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{SITE_NAME}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage enquiries and package content from one place.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-medium text-slate-800">
                <UserRound size={16} />
                {admin?.username || 'Admin'}
              </div>
              <div className="mt-1 text-xs text-slate-500">{admin?.email || 'Signed in'}</div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <DashboardStat label="Total Enquiries" value={enquiryStats.total} />
          <DashboardStat label="New Enquiries" value={enquiryStats.newCount} accent="amber" />
          <DashboardStat
            label="Contacted"
            value={enquiryStats.contactedCount}
            accent="blue"
          />
          <DashboardStat label="Closed" value={enquiryStats.closedCount} accent="green" />
          <DashboardStat label="Packages" value={packageStats.total} />
          <DashboardStat
            label="Featured Packages"
            value={packageStats.featuredCount}
            accent="emerald"
          />
        </section>

        <section className="mt-8 flex flex-wrap gap-3">
          <TabButton
            active={activeTab === 'enquiries'}
            onClick={() => setActiveTab('enquiries')}
            icon={<MessageSquare size={16} />}
            label="Enquiries"
          />
          <TabButton
            active={activeTab === 'packages'}
            onClick={() => setActiveTab('packages')}
            icon={<Boxes size={16} />}
            label="Packages"
          />
        </section>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {activeTab === 'enquiries' ? (
          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Enquiry Management</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review each lead, update its status, and remove spam or duplicates
                    when needed.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExportEnquiries}
                    disabled={!filteredEnquiries.length}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download size={16} className="mr-2" />
                    Export CSV
                  </button>

                  <button
                    onClick={loadDashboard}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),220px] lg:w-full lg:max-w-3xl">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={enquirySearch}
                      onChange={(event) => setEnquirySearch(event.target.value)}
                      placeholder="Search by name, phone, email, destination, or message"
                      className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <select
                    value={enquiryStatusFilter}
                    onChange={(event) => setEnquiryStatusFilter(event.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
                  >
                    {ENQUIRY_STATUS_FILTERS.map((statusOption) => (
                      <option key={statusOption.value} value={statusOption.value}>
                        {statusOption.label}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-sm text-slate-500">
                  Showing {filteredEnquiries.length} of {enquiries.length} enquiries
                </p>
              </div>
            </div>

            {loading ? (
              <LoadingState message="Loading enquiry dashboard..." />
            ) : filteredEnquiries.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="mx-auto text-slate-300" size={44} />}
                title={hasEnquiryFilters ? 'No matching enquiries' : 'No enquiries yet'}
                description={
                  hasEnquiryFilters
                    ? 'Try a different search or status filter to find the enquiry you need.'
                    : 'New website enquiries will appear here automatically.'
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Travel Plan</th>
                      <th className="px-6 py-4">Message</th>
                      <th className="px-6 py-4">Submitted</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEnquiries.map((enquiry) => {
                      const normalizedStatus = normalizeEnquiryStatus(enquiry.status);
                      const isUpdating = statusUpdatingId === enquiry._id;
                      const isDeleting = deletingEnquiryId === enquiry._id;

                      return (
                        <tr key={enquiry._id} className="align-top">
                          <td className="px-6 py-5">
                            <div className="font-semibold text-slate-900">{enquiry.name}</div>
                            <div className="mt-2 space-y-1 text-sm text-slate-500">
                              <div className="flex items-center gap-2">
                                <Phone size={14} />
                                {enquiry.phone}
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail size={14} />
                                {enquiry.email}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            <div className="flex items-start gap-2">
                              <MapPin size={15} className="mt-0.5 text-emerald-600" />
                              <div>
                                <div className="font-medium text-slate-800">
                                  {enquiry.package || enquiry.destination || 'Custom enquiry'}
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-slate-500">
                                  <CalendarDays size={14} />
                                  {formatDateOnly(enquiry.travelDate)}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="max-w-sm px-6 py-5 text-sm leading-6 text-slate-600">
                            {enquiry.message || 'No additional message provided.'}
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-500">
                            {formatDateTime(enquiry.createdAt)}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getEnquiryStatusClasses(
                                normalizedStatus
                              )}`}
                            >
                              {getEnquiryStatusLabel(normalizedStatus)}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-3">
                              <select
                                value={normalizedStatus}
                                onChange={(event) =>
                                  handleStatusChange(enquiry._id, event.target.value)
                                }
                                disabled={isUpdating}
                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500 disabled:opacity-60"
                              >
                                {ENQUIRY_STATUS_OPTIONS.map((statusOption) => (
                                  <option key={statusOption.value} value={statusOption.value}>
                                    {statusOption.label}
                                  </option>
                                ))}
                              </select>

                              <button
                                onClick={() => handleDeleteEnquiry(enquiry._id)}
                                disabled={isDeleting}
                                className="inline-flex items-center rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                              >
                                <Trash2 size={15} className="mr-2" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Package Management</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Create, edit, and publish the package content shown on the public
                    website.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={packageSearch}
                      onChange={(event) => setPackageSearch(event.target.value)}
                      placeholder="Search packages by title, slug, location, or content"
                      className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 sm:min-w-80"
                    />
                  </div>

                  <button
                    onClick={loadDashboard}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Refresh
                  </button>

                  <button
                    onClick={openCreatePackageForm}
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                  >
                    <PlusCircle size={16} className="mr-2" />
                    Add Package
                  </button>
                </div>
              </div>

              <div className="border-b border-slate-100 px-6 py-4 text-sm text-slate-500">
                Showing {filteredPackages.length} of {packages.length} packages
              </div>

              {loading ? (
                <LoadingState message="Loading packages..." />
              ) : filteredPackages.length === 0 ? (
                <EmptyState
                  icon={<Boxes className="mx-auto text-slate-300" size={44} />}
                  title={hasPackageSearch ? 'No matching packages' : 'No packages found'}
                  description={
                    hasPackageSearch
                      ? 'Try a different search term to find the package you need.'
                      : 'Create your first package to publish it on the website.'
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-6 py-4">Package</th>
                        <th className="px-6 py-4">Slug</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPackages.map((pkg) => (
                        <tr key={pkg._id}>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              {pkg.heroImage ? (
                                <img
                                  src={pkg.heroImage}
                                  alt={pkg.title}
                                  className="h-14 w-14 rounded-xl object-cover"
                                />
                              ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                  <Boxes size={20} />
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-slate-900">{pkg.title}</div>
                                <div className="mt-1 text-sm text-slate-500">
                                  {pkg.location}
                                  {pkg.location && pkg.duration ? ' / ' : ''}
                                  {pkg.duration}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-500">/{pkg.slug}</td>
                          <td className="px-6 py-5 text-sm text-slate-700">{pkg.category}</td>
                          <td className="px-6 py-5 text-sm font-semibold text-slate-900">
                            Rs {new Intl.NumberFormat('en-IN').format(Number(pkg.price) || 0)}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-2">
                              <StatusBadge
                                label={pkg.isActive ? 'Active' : 'Inactive'}
                                className={
                                  pkg.isActive
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-slate-200 text-slate-700'
                                }
                              />
                              {pkg.isFeatured ? (
                                <StatusBadge
                                  label="Featured"
                                  className="bg-amber-100 text-amber-700"
                                />
                              ) : null}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => openEditPackageForm(pkg)}
                                className="inline-flex items-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                              >
                                <Pencil size={15} className="mr-2" />
                                Edit
                              </button>

                              <button
                                onClick={() => handleDeletePackage(pkg._id)}
                                disabled={packageDeletingId === pkg._id}
                                className="inline-flex items-center rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                              >
                                <Trash2 size={15} className="mr-2" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {isPackageFormOpen ? (
              <PackageFormPanel
                form={packageForm}
                mode={packageFormMode}
                saving={packageSaving}
                error={packageFormError}
                onClose={closePackageForm}
                onSubmit={handlePackageSubmit}
                onFieldChange={handlePackageFieldChange}
                onToggleChange={handlePackageToggleChange}
                onGenerateSlug={handleGenerateSlug}
                onListChange={handlePackageListChange}
                onListAdd={handlePackageListAdd}
                onListRemove={handlePackageListRemove}
                onItineraryChange={handleItineraryChange}
                onItineraryAdd={handleItineraryAdd}
                onItineraryRemove={handleItineraryRemove}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

function escapeCsvValue(value) {
  const stringValue = String(value ?? '').replace(/\r?\n|\r/g, ' ').trim();

  if (/[",]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

const DashboardStat = ({ label, value, accent = 'slate' }) => {
  const accentClasses = {
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    green: 'bg-green-50 text-green-700',
    slate: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${accentClasses[accent]}`}
      >
        {label}
      </div>
      <div className="mt-4 text-3xl font-extrabold text-slate-900">{value}</div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
      active
        ? 'bg-slate-900 text-white'
        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
    }`}
  >
    <span className="mr-2">{icon}</span>
    {label}
  </button>
);

const StatusBadge = ({ label, className }) => (
  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
    {label}
  </span>
);

const LoadingState = ({ message }) => (
  <div className="px-6 py-16 text-center">
    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
    <p className="mt-4 text-sm text-slate-500">{message}</p>
  </div>
);

const EmptyState = ({ icon, title, description }) => (
  <div className="px-6 py-16 text-center">
    {icon}
    <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm text-slate-500">{description}</p>
  </div>
);

export default AdminPanel;
