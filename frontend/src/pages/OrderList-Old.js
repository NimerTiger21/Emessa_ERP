import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import ConfirmationModal from "../components/ConfirmationModal";
import { toast } from "react-toastify";
import { deleteOrder, fetchOrders } from "../services/orderService";
import OrderModal from "../components/order/OrderModal";
import Spinner from "./../components/Spinner";
import {
  fetchBrands,
  fetchCustomers,
  fetchStyles,
} from "../services/masterDataService";
import * as XLSX from "xlsx";

import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { MoreVertical, Edit, Trash2, Eye, Download } from "lucide-react";
import FabricModal from "../components/FabricModal";
import StyleModal from "../components/StyleModal";
import { FiPlus } from "react-icons/fi";

const OrderList = () => {
  const [editOrder, setEditOrder] = useState(null); // Track defect to edit
  const { currentColor } = useStateContext();

  const [isExporting, setIsExporting] = useState(false);
  const [exportScope, setExportScope] = useState("current"); // 'current' or 'all'
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Order Management States
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [sort, setSort] = useState({ field: "orderDate", order: "desc" });
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // Add these new states
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
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

  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // State for confirmation modal
  const [deleteId, setDeleteId] = useState(null); // ID of defect to be deleted

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCearteFabricModalOpen, setIsCearteFabricModalOpen] = useState(false);
  const [isCreateStyleModalOpen, setIsCreateStyleModalOpen] = useState(false);

  const styleMap = styles.reduce((acc, name) => {
    acc[name._id] = name.name;
    return acc;
  }, {});

  const customerNameMap = customers.reduce((acc, customer) => {
    acc[customer._id] = customer.name;
    return acc;
  }, {});

  const brandNameMap = brands.reduce((acc, brand) => {
    acc[brand._id] = brand.name;
    return acc;
  }, {});

  const navigate = useNavigate();

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

  const getRateColor = (rate) => {
    if (rate > 3.5) return "bg-red-100";
    if (rate > 2.5) return "bg-yellow-100";
    return "bg-green-100";
  };

  const getHoverColor = (rate) => {
    if (rate > 3.5) return "hover:bg-red-300"; // More intense red
    if (rate > 2.5) return "hover:bg-yellow-300"; // Stronger yellow
    return "hover:bg-green-300"; // Brighter green
  };

  const handleOrderCreated = (newOrder) => {
    setOrders([...orders, newOrder]);
  };

  // Open Edit Modal
  const openEditModal = (order) => {
    setEditOrder(order);
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setEditOrder(null); // Clear edit data
    setIsModalOpen(false);
    setIsCearteFabricModalOpen(false);
    setIsCreateStyleModalOpen(false);
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

  // Fetch orders from API
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders({
          page: pagination.page,
          limit: pagination.limit,
          sortField: sort.field,
          sortOrder: sort.order,
          search,
          style: styleFilter,
          dateFrom,
          dateTo,
          customer: customerFilter,
          brand: brandFilter,
          minDefectRate,
          maxDefectRate,
        });
        //setIsLoading(true);
        setOrders(data.data);
        setPagination((prev) => ({
          ...prev,
          totalPages: data.pagination.totalPages,
        }));
        console.log("Orders loaded:", data.data);
      } catch (error) {
        console.error("Error loading orders:", error);
        setIsLoading(false);
      }
    };
    loadOrders();
    setIsLoading(false);
  }, [
    pagination.page,
    pagination.limit,
    sort,
    search,
    styleFilter,
    dateFrom,
    dateTo,
    customerFilter,
    brandFilter,
    minDefectRate,
    maxDefectRate,
  ]);

  // Add reset filters function
  const resetFilters = () => {
    setSearch("");
    setStyleFilter("");
    setDateFrom("");
    setDateTo("");
    setCustomerFilter("");
    setBrandFilter("");
    setMinDefectRate("");
    setMaxDefectRate("");
  };

  const handleSearch = (value) => {
    if (!/^[a-zA-Z0-9]*$/.test(value)) {
      setError("Only numbers and letters allowed");
      toast.error("Only numbers and letters allowed");
      setSearch(""); // Clear search input if invalid
      return;
    }
    setError("");
    setSearch(value);
  };

  // Handle Pagination
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Handle Sorting
  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
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
      search || styleFilter || dateFrom || dateTo || customerFilter || brandFilter
        ? `Orders_Filtered_${date}.xlsx`
        : `Orders_Full_${date}.xlsx`;

    XLSX.writeFile(workbook, fileName, { compression: true });
    toast.success("Export completed successfully");
  };

  // Add this function in your component (before the return statement)
  const exportToExcel = () => {
    setIsExporting(true);
    try {
      // Prepare data for export
      const exportData = orders.map((order) => ({
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
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

      // Generate Excel file
      const date = new Date().toISOString().split("T")[0];
      XLSX.writeFile(workbook, `Orders_Export_${date}.xlsx`, {
        compression: true,
      });
      toast.success("Orders exported successfully!");
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("Failed to export orders: " + error.message);
    } finally {
      setIsExporting(false);
    }
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
              {search || styleFilter || dateFrom || dateTo || customerFilter || brandFilter
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="space-y-6">
        {/* 📌 Header + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold text-indigo-700 tracking-tight">
            🧾 Orders Dashboard
          </h1>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition"
            >
              <FiPlus /> New Order
            </button>
            <button
              onClick={openCreateFabricModal}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md hover:bg-purple-700 transition"
            >
              <FiPlus /> New Fabric
            </button>
            <button
              onClick={openCreateStyleModal}
              className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white font-semibold rounded-md shadow-md hover:bg-pink-600 transition"
            >
              <FiPlus /> New Style
            </button>
            <button
              onClick={() => setIsExportDialogOpen(true)}
              disabled={isExporting}
              className={`flex items-center gap-2 px-4 py-2 ${
                isExporting ? "bg-green-400" : "bg-green-600"
              } text-white font-semibold rounded-md shadow-md hover:bg-green-700 transition`}
            >
              {isExporting ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isExporting ? "Exporting..." : "Export to Excel"}
            </button>
          </div>
        </div>

        {/* 🔍 Filters Section */}
        <div className="p-6 bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

            {/* 👤 Customer */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Customer
              </label>
              <select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="select-field w-full"
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
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Brand
              </label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                disabled={brandDisabled}
                // className="select-field w-full"
                className={`select-field w-full ${
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
          </div>

          {/* 🎨 Style + Search + Reset */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Style
              </label>
              <select
                value={styleFilter}
                onChange={(e) => setStyleFilter(e.target.value)}
                disabled={styleDisabled}
                className={`select-field w-full ${
                  styleDisabled ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Select Style</option>
                {filteredStyles.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search orders..."
                className="input-field w-full"
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {styleFilter && (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            🧵 Style: <strong>{styleMap[styleFilter] || "Unknown"}</strong>
          </span>
        )}
        {customerFilter && (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            👤 Customer:{" "}
            <strong>{customerNameMap[customerFilter] || "Unknown"}</strong>
          </span>
        )}
        {brandFilter && (
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            🏷️ Brand: <strong>{brandNameMap[brandFilter] || "Unknown"}</strong>
          </span>
        )}
      </div>
      <hr className="my-4 border-t border-gray-300" />
      {/* Order Table */} {/* Order List Section */}
      <h2 className="text-lg font-bold text-gray-700 mt-8 mb-4 tracking-wide">
        📋 Orders List
      </h2>
      <div className="mt-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
        <table className="table-auto w-full bg-white shadow-md rounded border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th
                onClick={() => handleSort("orderNo")}
                className="cursor-pointer border p-2"
              >
                Order No{" "}
                {sort.field === "orderNo" && (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("customer")}
                className="cursor-pointer border p-2"
              >
                Customer{" "}
                {sort.field === "customer" &&
                  (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("brand")}
                className="cursor-pointer border p-2"
              >
                Brand{" "}
                {sort.field === "brand" && (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("style")}
                className="cursor-pointer"
              >
                Style{" "}
                {sort.field === "style" && (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("StyleNo")}
                className="cursor-pointer"
              >
                StyleNo{" "}
                {sort.field === "StyleNo" && (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("keyNo")}
                className="cursor-pointer border p-2"
              >
                Key No{" "}
                {sort.field === "keyNo" && (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("season")}
                className="cursor-pointer border p-2"
              >
                Season{" "}
                {sort.field === "season" && (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("articleNo")}
                className="cursor-pointer border p-2"
              >
                Article#{" "}
                {sort.field === "articleNo" &&
                  (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("fabric")}
                className="cursor-pointer border p-2"
              >
                Fabric{" "}
                {sort.field === "fabric" && (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("fabricComposition")}
                className="cursor-pointer border p-2"
              >
                Fabric Composition{" "}
                {sort.field === "fabricComposition" &&
                  (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("orderDate")}
                className="cursor-pointer"
              >
                Order Date{" "}
                {sort.field === "orderDate" &&
                  (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("orderQty")}
                className="cursor-pointer border p-2"
              >
                O-Qty{" "}
                {sort.field === "orderQty" &&
                  (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("totalDefectCount")}
                className="cursor-pointer border p-2"
              >
                D-Qty{" "}
                {sort.field === "totalDefectCount" &&
                  (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("fabricCode")}
                className="cursor-pointer border p-2"
              >
                Fabric Code{" "}
                {sort.field === "fabricCode" &&
                  (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("fabricSupplier")}
                className="cursor-pointer border p-2"
              >
                Fabric Supplier{" "}
                {sort.field === "fabricSupplier" &&
                  (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th>D-Ratio</th>
              <th>Actions</th>
              {/* New Actions Column */}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                // className={`hover:bg-gray-100 transition duration-150 ease-in-out ${getRateColor(
                //   order.defectRate
                // )}`}
                className={`transition duration-150 ease-in-out ${getRateColor(
                  order.defectRate
                )} ${getHoverColor(order.defectRate)}`}
              >
                <td className="border p-2">{order.orderNo}</td>
                <td className="border p-2">{order.customer?.name}</td>
                <td className="border p-2">
                  {order.brand?.name || "No Brand"}
                </td>
                <td className="border p-2">{order.style?.name}</td>
                <td className="border p-2">{order.styleNo}</td>
                <td className="border p-2">{order.keyNo}</td>
                <td className="border p-2">{order.season}</td>
                <td className="border p-2">{order.articleNo}</td>
                <td className="border p-2">{order.fabric?.name}</td>
                <td className="border p-2">
                  <td className="p-2">
                    {order.fabric?.fabricCompositions?.length > 0
                      ? (() => {
                          const compositionString =
                            order.fabric.fabricCompositions
                              .map(
                                (fc) =>
                                  `${fc.value}%${
                                    fc.compositionItem?.abbrPrefix || "Unknown"
                                  }`
                              )
                              .join(", ");
                          return compositionString.length > 30
                            ? compositionString.slice(0, 30) + "..."
                            : compositionString;
                        })()
                      : "No Composition"}
                  </td>
                </td>
                <td className="border p-2">
                  {order?.orderDate
                    ? new Date(order.orderDate).toLocaleDateString()
                    : "No date selected"}
                </td>
                <td className="border p-2">{order.orderQty}</td>
                <td className="border p-2">{order.totalDefectCount}</td>
                <td className="border p-2">{order.fabric?.code || "N/A"}</td>
                <td className="border p-2">{order.fabricSupplier?.name}</td>
                <td className="border p-2">{order.defectRate}%</td>
                {/* Actions */}
                <td className="border p-2 hidden">
                  {/* Delete Button */}
                  <button
                    onClick={() => openDeleteConfirm(order._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mr-2"
                  >
                    Delete
                  </button>
                  {/* Update Button Placeholder */}
                  <button
                    onClick={() => openEditModal(order)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    style={{ backgroundColor: currentColor }} // Inline style for dynamic color
                  >
                    Update
                  </button>
                  {/* Order Details Button Placeholder */}
                  <button
                    onClick={() => openOrderDetailsModal(order)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 ml-2"
                    style={{ backgroundColor: currentColor }} // Inline style for dynamic color
                  >
                    Details
                  </button>
                </td>

                <td className="border p-2 text-center">
                  <Menu as="div" className="relative inline-block text-left">
                    <div>
                      <Menu.Button className="inline-flex w-full justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none">
                        <MoreVertical className="w-5 h-5" />
                      </Menu.Button>
                    </div>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
                          {/* View Details */}
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => openOrderDetailsModal(order)}
                                className={`${
                                  active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                } group flex w-full items-center px-4 py-2 text-sm`}
                              >
                                <Eye className="mr-2 h-5 w-5 text-gray-500" />
                                View Details
                              </button>
                            )}
                          </Menu.Item>

                          {/* Edit Order */}
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => openEditModal(order)}
                                className={`${
                                  active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                } group flex w-full items-center px-4 py-2 text-sm`}
                              >
                                <Edit className="mr-2 h-5 w-5 text-blue-500" />
                                Edit Order
                              </button>
                            )}
                          </Menu.Item>

                          {/* Delete Order */}
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => openDeleteConfirm(order._id)}
                                className={`${
                                  active
                                    ? "bg-red-100 text-red-700"
                                    : "text-red-500"
                                } group flex w-full items-center px-4 py-2 text-sm`}
                              >
                                <Trash2 className="mr-2 h-5 w-5 text-red-500" />
                                Delete Order
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between">
        <button
          disabled={pagination.page === 1}
          onClick={() => handlePageChange(pagination.page - 1)}
          // className="p-2 bg-blue-500 text-white rounded"
          className={`px-4 py-2 ${
            pagination.page === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
          }`}
          style={{ backgroundColor: currentColor }} // Inline style for dynamic color
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          disabled={pagination.page === pagination.totalPages}
          onClick={() => handlePageChange(pagination.page + 1)}
          // className="p-2 bg-blue-500 text-white rounded"
          className={`px-4 py-2 ${
            pagination.page === pagination.totalPages
              ? "bg-gray-300"
              : "bg-blue-500 text-white"
          }`}
          style={{ backgroundColor: currentColor }} // Inline style for dynamic color
        >
          Next
        </button>
      </div>
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
          //editStyle={editStyle}
          refreshStyleList={loadStyles}
        />
      )}
      {isExportDialogOpen && <ExportDialog />}
    </div>
  );
};

export default OrderList;
