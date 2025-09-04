import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Download,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  X,
  ChevronRight,
  ChevronLeft,
  Info,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import {
  deleteOrder,
  fetchOrders,
  fetchOrderStatistics,
} from "../services/orderService";
import Spinner from "../components/Spinner";
import { useStateContext } from "../contexts/ContextProvider";
import OrderModal from "../components/order/OrderModal";
import {
  fetchBrands,
  fetchCustomers,
  fetchStyles,
} from "../services/masterDataService";
import ConfirmationModal from "../components/ConfirmationModal";
import StyleModal from "../components/StyleModal";
import FabricModal from "../components/FabricModal";
import { FiInfo } from "react-icons/fi";

const ModernOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0, // Total number of orders
    totalPages: 1,
  });
  // Add new state for statistics
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalQuantity: 0,
    totalDefects: 0,
    avgDefectRate: 0,
    highDefectOrders: 0,
    lowDefectOrders: 0,
    recentOrders: 0,
  });
  const [editOrder, setEditOrder] = useState(null); // Track defect to edit
  const { currentColor } = useStateContext();
  const [isExporting, setIsExporting] = useState(false);
  const [exportScope, setExportScope] = useState("current"); // 'current' or 'all'
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // State for confirmation modal
  const [deleteId, setDeleteId] = useState(null); // ID of defect to be deleted

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCearteFabricModalOpen, setIsCearteFabricModalOpen] = useState(false);
  const [isCreateStyleModalOpen, setIsCreateStyleModalOpen] = useState(false);

  const [sort, setSort] = useState({ field: "orderDate", order: "desc" });
  const [error, setError] = useState("");

  // Add these new states
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("");
  const [minDefectRate, setMinDefectRate] = useState("");
  const [maxDefectRate, setMaxDefectRate] = useState("");
  const [customers, setCustomers] = useState([]);
  const [brands, setBrands] = useState([]);

  const [filteredBrands, setFilteredBrands] = useState([]);
  const [brandDisabled, setBrandDisabled] = useState(true);

  const [filteredStyles, setFilteredStyles] = useState([]);
  const [styleDisabled, setStyleDisabled] = useState(true);

  const [styles, setStyles] = useState([]);
  const [styleFilter, setStyleFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  // Add debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [debouncedMinDefectRate, setDebouncedMinDefectRate] =
    useState(minDefectRate);
  const [debouncedMaxDefectRate, setDebouncedMaxDefectRate] =
    useState(maxDefectRate);

  const [filterOpen, setFilterOpen] = useState(false);

  const navigate = useNavigate();

  // Add sortable columns configuration
  const sortableColumns = [
    { key: "orderNo", label: "Order No", field: "orderNo" },
    { key: "orderDate", label: "Order Date", field: "orderDate" },
    { key: "customer", label: "Customer", field: "customer" },
    { key: "brand", label: "Brand", field: "brand" },
    { key: "style", label: "Style", field: "style" },
    { key: "orderQty", label: "Order Qty", field: "orderQty" },
    // { key: 'defectRate', label: 'Defect Rate', field: 'defectRate' }, // ✅ Add this
    { key: "season", label: "Season", field: "season" },
  ];

  // Handle column sorting
  const handleSort = (field) => {
    setSort((prevSort) => ({
      field,
      order:
        prevSort.field === field && prevSort.order === "asc" ? "desc" : "asc",
    }));
    // Reset to first page when sorting changes
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Get sort icon for a column
  const getSortIcon = (field) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sort.order === "asc" ? (
      <ArrowUp className="w-4 h-4 text-indigo-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-indigo-600" />
    );
  };

  // Sortable Header Component
  const SortableHeader = ({ field, label, className = "" }) => (
    <th
      className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors select-none ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center justify-between group">
        <span className="group-hover:text-gray-700 transition-colors">
          {label}
        </span>
        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {getSortIcon(field)}
        </div>
      </div>
    </th>
  );

  // Regular Header Component (non-sortable)
  const RegularHeader = ({ label, className = "" }) => (
    <th
      className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
    >
      {label}
    </th>
  );

  // Separate function to load statistics
  const loadStatistics = async () => {
    try {
      const stats = await fetchOrderStatistics({
        search,
        styleFilter,
        dateFrom,
        dateTo,
        customerFilter,
        brandFilter,
        seasonFilter,
        minDefectRate,
        maxDefectRate,
      });
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  // Load statistics when filters change
  useEffect(() => {
    loadStatistics();
  }, [
    search,
    styleFilter,
    dateFrom,
    dateTo,
    customerFilter,
    brandFilter,
    seasonFilter,
    minDefectRate,
    maxDefectRate,
  ]);

  // Fetch orders from API
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const data = await fetchOrders({
          page: pagination.page,
          limit: pagination.limit,
          // limit: 10000, // Large number to get all records
          sortField: sort.field,
          sortOrder: sort.order,
          // search,
          search: debouncedSearch, // Use debounced search here
          style: styleFilter,
          dateFrom,
          dateTo,
          customer: customerFilter,
          brand: brandFilter,
          season: seasonFilter,
          // minDefectRate,
          // maxDefectRate,
          minDefectRate: debouncedMinDefectRate,
          maxDefectRate: debouncedMaxDefectRate,
        });
        setOrders(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      } catch (error) {
        console.error("Error loading orders:", error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadOrders();
    }, 500); // Add debounce to filter changes

    return () => clearTimeout(timer);

    // loadOrders();
  }, [
    pagination.page,
    pagination.limit,
    sort,
    // search,
    debouncedSearch, // Add debouncedSearch to dependencies
    styleFilter,
    dateFrom,
    dateTo,
    customerFilter,
    brandFilter,
    seasonFilter,
    // minDefectRate,
    // maxDefectRate,
    debouncedMinDefectRate,
    debouncedMaxDefectRate,
  ]);

  // Add debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [search]);

  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     setDebouncedMinDefectRate(minDefectRate);
  //   }, 3000);

  //   return () => {
  //     clearTimeout(handler);
  //   };
  // }, [minDefectRate]);

  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     setDebouncedMaxDefectRate(maxDefectRate);
  //   }, 3000);

  //   return () => {
  //     clearTimeout(handler);
  //   };
  // }, [maxDefectRate]);

  useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedMinDefectRate(minDefectRate);
    setDebouncedMaxDefectRate(maxDefectRate);
  }, 1000);
  return () => clearTimeout(handler);
}, [minDefectRate, maxDefectRate]);


  // Load styles on component mount
  useEffect(() => {
    loadStyles();
  }, []);

  const loadStyles = async () => {
    try {
      const styleData = await fetchStyles();
      setStyles(styleData);
    } catch (error) {
      console.error("Failed to load styles");
    }
  };

  // Add this useEffect to load customers and brands
  useEffect(() => {
    const loadCustomersAndBrands = async () => {
      try {
        const [customersRes, brandsRes, stylesRes] = await Promise.all([
          // axios.get("/api/customers"),
          // axios.get("/api/brands"),
          fetchCustomers(),
          fetchBrands(),
          fetchStyles(),
        ]);
        setCustomers(customersRes);
        setBrands(brandsRes);
        setStyles(stylesRes);
      } catch (error) {
        console.error("Error loading customers/brands:", error);
      }
    };
    loadCustomersAndBrands();
  }, []);

  useEffect(() => {
    if (customerFilter) {
      const filtered = brands.filter(
        (brand) => brand.customer === customerFilter
      );
      setFilteredBrands(filtered);
      setBrandDisabled(false);
      setBrandFilter(""); // Reset brand selection
    } else {
      setFilteredBrands([]);
      setBrandDisabled(true);
      setBrandFilter("");
    }
  }, [customerFilter, brands]);

  useEffect(() => {
    if (brandFilter) {
      // Filter styles based on selected brand
      const filtered = styles.filter(
        (style) => style.brand._id === brandFilter
      );
      setFilteredStyles(filtered);
      setStyleDisabled(false);
      setStyleFilter(""); // Reset if brand changes
    } else {
      setFilteredStyles([]);
      setStyleDisabled(true);
      setStyleFilter("");
    }
  }, [brandFilter, styles]);

  const resetFilters = () => {
    // Reset all filters and pagination
    setSearch("");
    setStyleFilter("");
    setDateFrom("");
    setDateTo("");
    setCustomerFilter("");
    setBrandFilter("");
    setSeasonFilter("");
    setMinDefectRate("");
    setMaxDefectRate("");

    setPagination({ page: 1, limit: 10, totalPages: 1 });
    setFilterOpen(false);
    setSort({ field: "orderDate", order: "desc" });
    setIsExportDialogOpen(false);
    setIsModalOpen(false);
    // loadOrders();
  };

  // Handle Pagination
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleOrderCreated = (newOrder) => {
    setOrders([...orders, newOrder]);
  };

  // Function to update the defect in the list after editing
  const updateOrderInList = async (updatedOrder) => {
    if (!updatedOrder || !updatedOrder._id) {
      toast.error("Invalid updated order");
      return; // Exit if updatedOrder is invalid
    }
    setOrders((prevDefects) =>
      prevDefects.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
    //await loadOrders(); // Optionally refetch orders if needed
  };

  // Close Modal
  const closeModal = () => {
    setEditOrder(null); // Clear edit data
    setIsModalOpen(false);
    setIsCearteFabricModalOpen(false);
    setIsCreateStyleModalOpen(false);
  };

  // Open Confirmation Modal for Deletion
  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  // Confirm Order Deletion
  const handleConfirmDelete = async () => {
    try {
      const result = await deleteOrder(deleteId, navigate);
      if (!result?.defectsExist) {
        setOrders(orders.filter((order) => order._id !== deleteId));
      }
    } catch (error) {
      // No need for alert, toast is shown in service
    } finally {
      setIsConfirmOpen(false); // Close confirmation modal
    }
  };

  // Open Order Details
  const openOrderDetailsModal = (order) => {
    navigate(`/orders/${order._id}`, { state: { order } }); // Pass the order object
  };

  // Add these functions
  const exportFilteredData = async () => {
    setIsExporting(true);
    try {
      // Fetch all data with current filters (bypassing pagination)
      const { data } = await fetchOrders({
        page: 1,
        limit: 10000, // Large number to get all records
        sortField: sort.field,
        sortOrder: sort.order,
        search,
        style: styleFilter,
        dateFrom,
        dateTo,
        customerFilter,
        brandFilter,
        seasonFilter,
      });

      prepareAndDownloadExcel(data);
    } catch (error) {
      toast.error("Export failed: " + error.message);
    } finally {
      setIsExporting(false);
      setIsExportDialogOpen(false);
    }
  };

  const exportCurrentPage = () => {
    setIsExporting(true);
    try {
      prepareAndDownloadExcel(orders);
    } catch (error) {
      toast.error("Export failed: " + error.message);
    } finally {
      setIsExporting(false);
      setIsExportDialogOpen(false);
    }
  };

  const prepareAndDownloadExcel = (data) => {
    const exportData = data.map((order) => ({
      "Order No": order.orderNo,
      Customer: order.customer?.name || "",
      Brand: order.brand?.name || "",
      Style: order.style?.name || "",
      "Style No": order.styleNo || "",
      "Key No": order.keyNo || "",
      Season: order.season || "",
      "Article No": order.articleNo || "",
      Fabric: order.fabric?.name || "",
      "Fabric Composition":
        order.fabric?.fabricCompositions?.length > 0
          ? order.fabric.fabricCompositions
              .map(
                (fc) => `${fc.value}%${fc.compositionItem?.abbrPrefix || ""}`
              )
              .join(", ")
          : "",
      "Order Date": order.orderDate
        ? new Date(order.orderDate).toLocaleDateString()
        : "",
      "Order Qty": order.orderQty || 0,
      "Defect Qty": order.totalDefectCount || 0,
      "Defect Rate": `${order.defectRate || 0}%`,
      "Fabric Code": order.fabric?.code || "",
      "Fabric Supplier": order.fabricSupplier?.name || "",
      "Created At": new Date(order.createdAt).toLocaleString(),
      "Updated At": new Date(order.updatedAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    // Auto-size columns
    const wscols = [
      { wch: 10 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 20 },
      { wch: 25 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
    ];
    worksheet["!cols"] = wscols;

    // Add filters to header row
    worksheet["!autofilter"] = { ref: `A1:R1` };

    const date = new Date().toISOString().split("T")[0];
    const fileName =
      search ||
      styleFilter ||
      dateFrom ||
      dateTo ||
      customerFilter ||
      brandFilter ||
      seasonFilter
        ? `Orders_Filtered_${date}.xlsx`
        : `Orders_Full_${date}.xlsx`;

    XLSX.writeFile(workbook, fileName, { compression: true });
    toast.success("Export completed successfully");
  };

  // Calculate statistics
  const totalOrders = orders.length;
  const totalQuantity = orders.reduce((sum, order) => sum + order.orderQty, 0);
  const totalDefects = orders.reduce(
    (sum, order) => sum + order.totalDefectCount,
    0
  );
  const avgDefectRate = (totalDefects / totalQuantity) * 100;
  const highDefectOrders = orders.filter(
    (order) => order.defectRate > 4
  ).length;
  const lowDefectOrders = orders.filter(
    (order) => order.defectRate <= 4
  ).length;
  const recentOrders = orders.filter((order) => {
    const orderDate = new Date(order.orderDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return orderDate > weekAgo;
  }).length;

  // Calculate total order value (assuming average unit price for demonstration)
  const avgUnitPrice = 15; // Example: $15 per unit
  const totalOrderValue = totalQuantity * avgUnitPrice;
  
  // Calculate potential revenue loss due to defects
  const defectCost = totalDefects * avgUnitPrice; // Cost of defective units
  const reworkCost = totalDefects * 5; // Estimated rework cost per defective unit
  const totalRevenueLoss = defectCost + reworkCost;

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color,
    bgColor,
  }) => (
    <div
      className={`${bgColor} backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              {trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div
          className={`${color} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const FilterPanel = () => (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        filterOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setFilterOpen(false)}
      />
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ${
          filterOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Advanced Filters
            </h3>
            <button
              onClick={() => setFilterOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 🔍 Filters Section */}
        <div className="p-6 space-y-6">
          {/* 📅 Date Range */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-field w-full"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>
          {/* 🧑‍🤝‍🧑 Customer, Brand, Style, Season, Defect Rate Filters */}
          {/* 👤 Customer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
            >
              <option value="">All Customers</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🏷️ Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <select
              // className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              disabled={brandDisabled}
              // className="select-field w-full"
              className={`select-field w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                brandDisabled ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              <option value="">Select Brand</option>
              {filteredBrands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
            <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-medium">
              🎨 Brand-linked Styles Active
            </span>
          </div>

          {/* 🎨 Style + Reset */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <select
              value={styleFilter}
              onChange={(e) => setStyleFilter(e.target.value)}
              disabled={styleDisabled}
              className={`select-field w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500${
                styleDisabled ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              <option value="">All Styles</option>
              {filteredStyles.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Season
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
            >
              <option value="">All Seasons</option>
              <option value="1-25">Season 1-25</option>
              <option value="2-25">Season 2-25</option>
            </select>
          </div>

          {/* 🧪 Defect Rate Range */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Defect Rate (%)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={minDefectRate}
                onChange={(e) => setMinDefectRate(e.target.value)}
                placeholder="Min"
                className="input-field w-full"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={maxDefectRate}
                onChange={(e) => setMaxDefectRate(e.target.value)}
                placeholder="Max"
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={resetFilters}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => {
                setFilterOpen(false);
                // loadOrders(); // Reload orders with new filters
              }}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ActiveFiltersDisplay = () => {
    const activeFilters = [];

    if (search)
      activeFilters.push({ label: "Search", value: search, key: "search" });
    if (dateFrom || dateTo)
      activeFilters.push({
        label: "Date Range",
        value: `${
          dateFrom ? new Date(dateFrom).toLocaleDateString() : "Start"
        } - ${dateTo ? new Date(dateTo).toLocaleDateString() : "End"}`,
        key: "date",
      });
    if (customerFilter) {
      const customer = customers.find((c) => c._id === customerFilter);
      activeFilters.push({
        label: "Customer",
        value: customer?.name || "Unknown",
        key: "customer",
      });
    }
    if (brandFilter) {
      const brand = brands.find((b) => b._id === brandFilter);
      activeFilters.push({
        label: "Brand",
        value: brand?.name || "Unknown",
        key: "brand",
      });
    }
    if (styleFilter) {
      const style = styles.find((s) => s._id === styleFilter);
      activeFilters.push({
        label: "Style",
        value: style?.name || "Unknown",
        key: "style",
      });
    }
    if (seasonFilter)
      activeFilters.push({
        label: "Season",
        value: seasonFilter,
        key: "season",
      });
    if (minDefectRate || maxDefectRate) {
      activeFilters.push({
        label: "Defect Rate",
        value: `${minDefectRate || "0"}% - ${maxDefectRate || "100"}%`,
        key: "defectRate",
      });
    }

    const removeFilter = (filterKey) => {
      switch (filterKey) {
        case "search":
          setSearch("");
          break;
        case "date":
          setDateFrom("");
          setDateTo("");
          break;
        case "customer":
          setCustomerFilter("");
          break;
        case "brand":
          setBrandFilter("");
          break;
        case "style":
          setStyleFilter("");
          break;
        case "season":
          setSeasonFilter("");
          break;
        case "defectRate":
          setMinDefectRate("");
          setMaxDefectRate("");
          break;
      }
    };

    if (activeFilters.length === 0) return null;

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Active Filters ({activeFilters.length})
          </h3>
          <button
            onClick={resetFilters}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Clear All
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium"
            >
              <span className="font-semibold">{filter.label}:</span>
              <span className="max-w-32 truncate">{filter.value}</span>
              <button
                onClick={() => removeFilter(filter.key)}
                className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  };

  const getDefectRateColor = (rate) => {
    if (rate < 2) return "bg-green-100 text-green-800";
    if (rate < 4) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getDefectRateIcon = (rate) => {
    if (rate < 2) return CheckCircle;
    if (rate < 3) return Clock;
    return AlertTriangle;
  };

  const openModal = () => setIsModalOpen(true);
  const openCreateFabricModal = () => setIsCearteFabricModalOpen(true);
  const openCreateStyleModal = () => setIsCreateStyleModalOpen(true);
  const closeConfirm = () => setIsConfirmOpen(false);

  // Add this component before the main return
  const ExportDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Export Options</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="exportCurrent"
              name="exportScope"
              value="current"
              checked={exportScope === "current"}
              onChange={() => setExportScope("current")}
              className="mr-2"
            />
            <label htmlFor="exportCurrent">
              Current page only ({orders.length} records)
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="exportAll"
              name="exportScope"
              value="all"
              checked={exportScope === "all"}
              onChange={() => setExportScope("all")}
              className="mr-2"
            />
            <label htmlFor="exportAll">
              All filtered records (
              {search ||
              styleFilter ||
              dateFrom ||
              dateTo ||
              customerFilter ||
              brandFilter ||
              seasonFilter
                ? "with current filters"
                : "complete dataset"}
              )
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setIsExportDialogOpen(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={
              exportScope === "current" ? exportCurrentPage : exportFilteredData
            }
            disabled={isExporting}
            className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 ${
              isExporting ? "opacity-70" : ""
            }`}
          >
            {isExporting ? (
              <>
                <span className="animate-spin">⏳</span>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Orders Dashboard
                  </h1>
                  <p className="text-sm text-gray-600">
                    Manage and track all order activities
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => resetFilters()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => setIsExportDialogOpen(true)}
                disabled={isExporting}
                className={`flex items-center gap-2 px-4 py-2 ${
                  isExporting ? "bg-green-400" : "bg-green-600"
                } text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm`}
              >
                {isExporting ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Download className="w-5 h-5" />
                )}
                {isExporting ? "Exporting..." : "Export to Excel"}
              </button>
              <button
                onClick={openModal}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Order
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Orders"
            value={statistics.totalOrders.toLocaleString()}
            icon={Package}
            trend="up"
            trendValue="+12%"
            color="bg-blue-500"
            bgColor="bg-blue-50/80"
          />
          <StatCard
            title="Total Quantity"
            value={statistics.totalQuantity.toLocaleString()}
            icon={BarChart3}
            trend="up"
            trendValue="+8%"
            color="bg-green-500"
            bgColor="bg-green-50/80"
          />
          <StatCard
            title="Avg Defect Rate"
            value={`${statistics.avgDefectRate.toFixed(2)}%`}
            icon={Activity}
            trend="down"
            trendValue="-0.5%"
            color="bg-orange-500"
            bgColor="bg-orange-50/80"
          />
          {/* <StatCard
            title="Quality Score"
            value="92.5"
            icon={Target}
            trend="up"
            trendValue="+2.1"
            color="bg-purple-500"
            bgColor="bg-purple-50/80"
          /> */}
          <StatCard
            title="Revenue Impact"
            value={`${(totalRevenueLoss / 1000).toFixed(1)}K`}
            icon={TrendingDown}
            trend="down"
            trendValue="-$2.3K"
            color="bg-red-500"
            bgColor="bg-red-50/80"
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">High Defect Orders</p>
                  <div className="relative group">
                    <FiInfo className="w-4 h-4 text-gray-400 cursor-pointer" />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block text-xs bg-gray-800 text-white px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                      Orders with defect rate exceeds {">"} 4%
                    </div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {statistics.highDefectOrders}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">Low Defect Orders </p>
                  <div className="relative group">
                    <FiInfo className="w-4 h-4 text-gray-400 cursor-pointer" />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block text-xs bg-gray-800 text-white px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                      Orders with defect rate below or equal 4%
                    </div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {statistics.lowDefectOrders}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Recent Orders
                  </p>
                  <div className="relative group">
                    <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-pointer" />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block text-xs bg-gray-800 dark:bg-gray-700 text-white px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                      Orders Added in last 7 days
                    </div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {recentOrders}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by number, keyNo, or styleNo..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search !== debouncedSearch && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                </div>
              )}
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        <ActiveFiltersDisplay />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6 animate-in slide-in-from-top-4 duration-500">
            <p className="text-red-700 dark:text-red-400 font-medium text-center">
              {error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 dark:border-gray-700/20 text-center">
            <div className="inline-flex items-center gap-3 text-blue-600">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xl font-medium">Loading orders...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Orders Table with Sortable Headers */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/80 backdrop-blur-sm">
                    <tr>
                      <SortableHeader field="orderNo" label="Order Details" />
                      <SortableHeader
                        field="customer"
                        label="Customer & Brand"
                      />
                      <SortableHeader field="style" label="Style & Fabric" />
                      <SortableHeader field="orderQty" label="Quantities" />
                      <SortableHeader field="defectRate" label="Defect Rate" />
                      {/* <ClientSortableHeader field="defectRate" label="Defect Rate" /> */}
                      {/* <RegularHeader label="Defect Rate" /> */}
                      <RegularHeader label="Actions" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order, index) => {
                      const DefectIcon = getDefectRateIcon(order.defectRate);
                      return (
                        <tr
                          key={order._id}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                  {order.orderNo}
                                </span>
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  {order.season}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(
                                    order.orderDate
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">
                                {order.customer.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {order.brand.name}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {/* Style Name */}
                              <div className="font-semibold text-gray-900">
                                {order.style.name}
                              </div>

                              {/* Fabric Name & Supplier */}
                              <div className="text-sm">
                                <span className="font-semibold text-indigo-700">
                                  {order.fabric.name}
                                </span>
                                <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                                  {" "}
                                  — {order.fabricSupplier.name}
                                </span>
                              </div>

                              {/* Composition */}
                              <div className="text-xs text-gray-500">
                                {order.fabric.fabricCompositions
                                  .map(
                                    (fc) =>
                                      `${fc.value}%${fc.compositionItem.abbrPrefix}`
                                  )
                                  .join(", ")}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {order.orderQty?.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ordered
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-red-600">
                                  {order.totalDefectCount?.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  defects
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getDefectRateColor(
                                  order.defectRate
                                )}`}
                              >
                                <DefectIcon className="w-3 h-3" />
                                {order.defectRate}%
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openOrderDetailsModal(order)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditOrder(order);
                                  setIsModalOpen(true);
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteConfirm(order._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {orders.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing{" "}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}
                    </span>{" "}
                    of <span className="font-medium">{pagination.total}</span>{" "}
                    orders
                  </div>
                  <div className="flex items-center">
                    <label className="text-sm text-gray-700 dark:text-gray-300 mr-2">
                      Items per page:
                    </label>
                    <select
                      value={pagination.limit}
                      onChange={(e) =>
                        setPagination({
                          ...pagination,
                          page: 1,
                          limit: Number(e.target.value),
                        })
                      }
                      className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handlePageChange(Math.max(1, pagination.page - 1))
                      }
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNum = i + 1;
                          } else if (
                            pagination.page >=
                            pagination.totalPages - 2
                          ) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = pagination.page - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                pagination.page === pageNum
                                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                              } transition-colors duration-200`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      {pagination.totalPages > 5 &&
                        pagination.page < pagination.totalPages - 2 && (
                          <>
                            <span className="px-1">...</span>
                            <button
                              onClick={() =>
                                handlePageChange(pagination.totalPages)
                              }
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                pagination.page === pagination.totalPages
                                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                              } transition-colors duration-200`}
                            >
                              {pagination.totalPages}
                            </button>
                          </>
                        )}
                    </div>

                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.min(pagination.totalPages, pagination.page + 1)
                        )
                      }
                      disabled={pagination.page === pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <FilterPanel />

      {/* Create / Update Order Modal */}
      {isModalOpen && (
        <OrderModal
          closeModal={closeModal}
          onOrderCreated={handleOrderCreated}
          editOrder={editOrder}
          updateOrderInList={updateOrderInList}
          currentColor={currentColor}
        />
      )}
      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <ConfirmationModal
          message="Are you sure you want to delete this order?"
          onConfirm={handleConfirmDelete}
          onCancel={closeConfirm}
        />
      )}
      {/* Create Fabric Modal */}
      {isCearteFabricModalOpen && (
        <FabricModal closeModal={closeModal} refreshFabricList={loadStyles} />
      )}
      {/* Create Style Modal */}
      {isCreateStyleModalOpen && (
        <StyleModal
          closeModal={closeModal}
          isOpen={isCreateStyleModalOpen}
          refreshStyleList={loadStyles}
        />
      )}
      {isExportDialogOpen && <ExportDialog />}
    </div>
  );
};

export default ModernOrderList;
