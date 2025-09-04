// src/pages/DefectList.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PRODUCTION_LINES } from "../data/dummy";
//import axios from "../services/api";
import LogDefectModal from "../components/defect/LogDefectModal";
import { useStateContext } from "../contexts/ContextProvider";
//import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import ConfirmationModal from "./../components/ConfirmationModal";
import { toast } from "react-toastify";
import { fetchDefects, deleteDefect } from "../services/defectService";
import {
  fetchDefectTypes,
  fetchDefectNames,
} from "../services/masterDataService"; // Assuming fetchDefectNames exists
import Spinner from "../components/Spinner";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { MoreVertical, Edit, Trash2, Eye, Calendar, X } from "lucide-react"; // Import icons

const DefectList = () => {
  const { currentColor } = useStateContext();
  const navigate = useNavigate();

  // Defect management states
  const [defects, setDefects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editDefect, setEditDefect] = useState(null);

  // Filter and sort states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [sort, setSort] = useState({ field: "detectedDate", order: "desc" });
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [defectTypeFilter, setDefectTypeFilter] = useState("");
  const [defectNameFilter, setDefectNameFilter] = useState("");
  const [lineFilter, setLineFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [defectTypes, setDefectTypes] = useState([]);
  const [defectNames, setDefectNames] = useState([]);
  const [availableDefectNames, setAvailableDefectNames] = useState([]);

  // Get unique production lines from defects
  const [productionLines, setProductionLines] = useState([]);

  // Fetch defect types on component mount
  useEffect(() => {
    const loadDefectTypes = async () => {
      try {
        const types = await fetchDefectTypes();
        setDefectTypes(types);
      } catch (error) {
        console.error("Failed to load defect types");
      }
    };
    loadDefectTypes();
  }, []);

  // Fetch defect names on component mount
  useEffect(() => {
    const loadDefectNames = async () => {
      try {
        const names = await fetchDefectNames();
        setDefectNames(names);
      } catch (error) {
        console.error("Failed to load defect names");
      }
    };
    loadDefectNames();
  }, []);

  // Filter defect names based on selected defect type
  useEffect(() => {
    if (defectTypeFilter && defectNames.length > 0) {
      const filteredNames = defectNames.filter(
        // (name) => name.defectType === defectTypeFilter
        (name) => name.type._id === defectTypeFilter
      );
      setAvailableDefectNames(filteredNames);
    } else {
      setAvailableDefectNames([]);
      setDefectNameFilter(""); // Reset defect name filter when type changes
    }
  }, [defectTypeFilter, defectNames]);

  // Load defects with filters and pagination
  useEffect(() => {
    const loadDefects = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDefects({
          page: pagination.page,
          limit: pagination.limit,
          sortField: sort.field,
          sortOrder: sort.order,
          search,
          severity: severityFilter,
          defectType: defectTypeFilter,
          defectName: defectNameFilter,
          productionLine: lineFilter,
          dateFrom: dateFromFilter,
          dateTo: dateToFilter,
        });

        setDefects(data.data);
        setPagination((prev) => ({
          ...prev,
          totalPages: data.pagination.totalPages,
        }));

        // Extract unique production lines from the data
        const uniqueLines = [
          ...new Set(
            data.data.map((defect) => defect.productionLine).filter(Boolean)
          ),
        ];
        setProductionLines(uniqueLines);
      } catch (error) {
        console.error("Error loading defects:", error);
        toast.error("Failed to load defects");
      } finally {
        setIsLoading(false);
      }
    };

    loadDefects();
  }, [
    pagination.page,
    pagination.limit,
    sort,
    search,
    severityFilter,
    defectTypeFilter,
    defectNameFilter,
    lineFilter,
    dateFromFilter,
    dateToFilter,
  ]);

  // Modal handling functions
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setEditDefect(null);
    setIsModalOpen(false);
  };

  const openEditModal = (defect) => {
    setEditDefect(defect);
    setIsModalOpen(true);
  };

  // Delete confirmation functions
  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDefect(deleteId);
      setDefects(defects.filter((defect) => defect._id !== deleteId));
    } catch (error) {
      console.error("Error deleting defect:", error);
    } finally {
      setIsConfirmOpen(false);
    }
  };

  // Function to add new defect to the list
  const onDefectCreated = (newDefect) => {
    setDefects([newDefect, ...defects]);
  };

  // Function to update defect in the list
  const updateDefectInList = (updatedDefect) => {
    setDefects((prevDefects) =>
      prevDefects.map((defect) =>
        defect._id === updatedDefect._id ? updatedDefect : defect
      )
    );
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Sort handlers
  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  // View defect details
  const viewDefectDetails = (defect) => {
    navigate(`/defects/${defect._id}`);
  };

  // Handle search with debounce
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearch("");
    setSeverityFilter("");
    setDefectTypeFilter("");
    setDefectNameFilter("");
    setLineFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Check if any filters are active
  const hasActiveFilters =
    search ||
    severityFilter ||
    defectTypeFilter ||
    defectNameFilter ||
    lineFilter ||
    dateFromFilter ||
    dateToFilter;

  if (isLoading && defects.length === 0) {
    return <Spinner />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Defects Management</h1>
        <button
          onClick={openModal}
          className="px-6 py-2 text-white font-semibold rounded-md shadow-md hover:opacity-90 transition duration-200"
          style={{ backgroundColor: currentColor }}
        >
          Create New Defect
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition duration-200"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </button>
          )}
        </div>

        {/* First Row of Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search Bar */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search defects by description, order no..."
              value={search}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Production Line Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Production Line
            </label>
            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Lines</option>
              {/* {productionLines.map((line) => ( */}
              {PRODUCTION_LINES.map((line) => (
                <option key={line} value={line}>
                  {/* Line {line} */}
                  {line}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row of Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Defect Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Defect Type
            </label>
            <select
              value={defectTypeFilter}
              onChange={(e) => setDefectTypeFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Defect Types</option>
              {defectTypes.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Defect Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Defect Name
            </label>
            <select
              value={defectNameFilter}
              onChange={(e) => setDefectNameFilter(e.target.value)}
              disabled={!defectTypeFilter}
              className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                !defectTypeFilter ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              <option value="">
                {defectTypeFilter
                  ? "All Defect Names"
                  : "Select Defect Type First"}
              </option>
              {availableDefectNames.map((name) => (
                <option key={name._id} value={name._id}>
                  {name.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date From Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Date To Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                min={dateFromFilter}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            {search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: {search}
              </span>
            )}
            {severityFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Severity: {severityFilter}
              </span>
            )}
            {defectTypeFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Type:{" "}
                {defectTypes.find((t) => t._id === defectTypeFilter)?.name}
              </span>
            )}
            {defectNameFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Name:{" "}
                {
                  availableDefectNames.find((n) => n._id === defectNameFilter)
                    ?.name
                }
              </span>
            )}
            {lineFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Line: {lineFilter}
              </span>
            )}
            {dateFromFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                From: {dateFromFilter}
              </span>
            )}
            {dateToFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                To: {dateToFilter}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Defects Table */}
      {/* <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto"> */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              onClick={() => handleSort("orderId.orderNo")}
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100"
            >
              Order No{" "}
              {sort.field === "orderId.orderNo" &&
                (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("defectprocess.name")}
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100"
            >
              Defect Season{" "}
              {sort.field === "orderId.season" &&
                (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("defectName.name")}
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100"
            >
              Defect Name{" "}
              {sort.field === "defectName.name" &&
                (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("defectType.name")}
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100"
            >
              Defect Type{" "}
              {sort.field === "defectType.name" &&
                (sort.order === "asc" ? "↑" : "↓")}
            </th>            
            <th
              onClick={() => handleSort("severity")}
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100"
            >
              Severity{" "}
              {sort.field === "severity" && (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("detectedDate")}
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100"
            >
              Detected Date{" "}
              {sort.field === "detectedDate" &&
                (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("status")}
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100"
            >
              Status{" "}
              {sort.field === "status" && (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("defectCount")}
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100"
            >
              Count{" "}
              {sort.field === "defectCount" &&
                (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("productionLine")}
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100"
            >
              Line{" "}
              {sort.field === "productionLine" &&
                (sort.order === "asc" ? "↑" : "↓")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {defects.length === 0 ? (
            <tr>
              <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                No defects found. Try adjusting your filters or create a new
                defect.
              </td>
            </tr>
          ) : (
            defects.map((defect) => (
              <tr
                key={defect._id}
                className="hover:bg-gray-50 transition duration-150 ease-in-out"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {defect.orderId?.orderNo || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {defect.orderId?.season || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {defect.defectName?.name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {defect.defectType?.name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      defect.severity === "High"
                        ? "bg-red-100 text-red-800"
                        : defect.severity === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {defect.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {defect.detectedDate
                    ? new Date(defect.detectedDate).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      defect.status === "Resolved"
                        ? "bg-green-100 text-green-800"
                        : defect.status === "In Progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {defect.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {defect.defectCount || "0"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {defect.productionLine || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <Menu as="div" className="relative inline-block text-left">
                    <div>
                      <Menu.Button className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => viewDefectDetails(defect)}
                                className={`${
                                  active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                } group flex w-full items-center px-4 py-2 text-sm`}
                              >
                                <Eye className="mr-3 h-4 w-4" />
                                View Details
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => openEditModal(defect)}
                                className={`${
                                  active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                } group flex w-full items-center px-4 py-2 text-sm`}
                              >
                                <Edit className="mr-3 h-4 w-4" />
                                Edit
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => openDeleteConfirm(defect._id)}
                                className={`${
                                  active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                } group flex w-full items-center px-4 py-2 text-sm`}
                              >
                                <Trash2 className="mr-3 h-4 w-4 text-red-500" />
                                Delete
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* </div>
      </div> */}

      {/* Pagination Controls */}
      {defects.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow-md">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                pagination.page === 1
                  ? "text-gray-500 bg-gray-100 cursor-not-allowed"
                  : "text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                pagination.page === pagination.totalPages
                  ? "text-gray-500 bg-gray-100 cursor-not-allowed"
                  : "text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page{" "}
                <span className="font-medium">{pagination.page}</span> of{" "}
                <span className="font-medium">{pagination.totalPages}</span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <label className="text-sm text-gray-700 mr-2">
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
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.page === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    pagination.page === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>

                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const totalPageButtons = 5;
                    let startPage = Math.max(
                      1,
                      pagination.page - Math.floor(totalPageButtons / 2)
                    );
                    let endPage = Math.min(
                      pagination.totalPages,
                      startPage + totalPageButtons - 1
                    );

                    if (endPage - startPage < totalPageButtons - 1) {
                      startPage = Math.max(1, endPage - totalPageButtons + 1);
                    }

                    const pageNumber = startPage + i;
                    if (pageNumber <= endPage) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.page === pageNumber
                              ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    return null;
                  }
                )}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    pagination.page === pagination.totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.page === pagination.totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Last
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Defect Modal */}
      {isModalOpen && (
        <LogDefectModal
          closeModal={closeModal}
          onDefectCreated={onDefectCreated}
          editDefect={editDefect}
          updateDefectInList={updateDefectInList}
          currentColor={currentColor}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmOpen && (
        <ConfirmationModal
          message="Are you sure you want to delete this defect?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </div>
  );
};

export default DefectList;
