// src/pages/DefectList.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
//import axios from "../services/api";
import LogDefectModal from "../components/LogDefectModal";
import { useStateContext } from "../contexts/ContextProvider";
//import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import ConfirmationModal from "./../components/ConfirmationModal";
import { toast } from "react-toastify";
import { fetchDefects, deleteDefect } from "../services/defectService";
import { fetchDefectTypes } from "../services/masterDataService"; // Assuming this exists
import Spinner from "../components/Spinner";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { MoreVertical, Edit, Trash2, Eye } from "lucide-react"; // Import icons

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
  const [defectTypes, setDefectTypes] = useState([]);
  //const [monthFilter, setMonthFilter] = useState("");

  // Available months for filtering
  // const months = [
  //   "January",
  //   "February",
  //   "March",
  //   "April",
  //   "May",
  //   "June",
  //   "July",
  //   "August",
  //   "September",
  //   "October",
  //   "November",
  //   "December",
  // ];

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
          //month: monthFilter,
          //detectedDate : monthFilter
        });

        setDefects(data.data);
        setPagination((prev) => ({
          ...prev,
          totalPages: data.pagination.totalPages,
        }));
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
    //monthFilter,
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

  //const closeConfirm = () => setIsConfirmOpen(false);

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

  if (isLoading && defects.length === 0) {
    return <Spinner />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header and Filter Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Header */}
        <h1 className="text-xl font-bold text-gray-800 flex-shrink-0">
          Defects Management
        </h1>

        {/* Search Bar */}
        <div className="flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search defects by description, order no..."
            value={search}
            onChange={handleSearchChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-500"
          />
        </div>

        {/* Severity Filter */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-500"
        >
          <option value="">All Severities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Defect Type Filter */}
        <select
          value={defectTypeFilter}
          onChange={(e) => setDefectTypeFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-500"
        >
          <option value="">All Defect Types</option>
          {defectTypes.map((type) => (
            <option key={type._id} value={type._id}>
              {type.name}
            </option>
          ))}
        </select>

        {/* Month Filter */}
        {/* <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-500"
        >
          <option value="">All Months</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select> */}

        {/* Create Button */}
        <button
          onClick={openModal}
          className="px-4 py-2 text-white font-semibold rounded-md shadow-md hover:opacity-90 transition duration-200 flex-shrink-0"
          style={{ backgroundColor: currentColor }}
        >
          Create New Defect
        </button>
      </div>

      {/* Defects Table */}
      <div>
        {/* <div className="overflow-x-auto"> */}
        <table className="min-w-full bg-white shadow-md rounded border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th
                onClick={() => handleSort("orderId.orderNo")}
                className="cursor-pointer border p-2 text-left"
              >
                Order No{" "}
                {sort.field === "orderId.orderNo" &&
                  (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("defectName.name")}
                className="cursor-pointer border p-2 text-left"
              >
                Defect Name{" "}
                {sort.field === "defectName.name" &&
                  (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("defectType.name")}
                className="cursor-pointer border p-2 text-left"
              >
                Defect Type{" "}
                {sort.field === "defectType.name" &&
                  (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("defectprocess.name")}
                className="cursor-pointer border p-2 text-left"
              >
                Defect Position{" "}
                {sort.field === "defectprocess.name" &&
                  (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("severity")}
                className="cursor-pointer border p-2 text-left"
              >
                Severity{" "}
                {sort.field === "severity" &&
                  (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("detectedDate")}
                className="cursor-pointer border p-2 text-left"
              >
                Detected Date{" "}
                {sort.field === "detectedDate" &&
                  (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("status")}
                className="cursor-pointer border p-2 text-left"
              >
                Status{" "}
                {sort.field === "status" && (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("defectCount")}
                className="cursor-pointer border p-2 text-left"
              >
                Count{" "}
                {sort.field === "defectCount" &&
                  (sort.order === "asc" ? "↑" : "↓")}
              </th>
              {/* <th
                onClick={() => handleSort("month")}
                className="cursor-pointer border p-2 text-left"
              >
                Month{" "}
                {sort.field === "month" && (sort.order === "asc" ? "↑" : "↓")}
              </th> */}
              <th
                onClick={() => handleSort("productionLine")}
                className="cursor-pointer border p-2 text-left"
              >
                Line{" "}
                {sort.field === "productionLine" &&
                  (sort.order === "asc" ? "↑" : "↓")}
              </th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {defects.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center p-4">
                  No defects found. Try changing your filters or create a new
                  defect.
                </td>
              </tr>
            ) : (
              defects.map((defect) => (
                <tr
                  key={defect._id}
                  className="hover:bg-gray-100 transition duration-150 ease-in-out"
                >
                  <td className="border p-2">
                    {defect.orderId?.orderNo || "N/A"}
                  </td>
                  <td className="border p-2">
                    {defect.defectName?.name || "N/A"}
                  </td>
                  <td className="border p-2">
                    {defect.defectType?.name || "N/A"}
                  </td>
                  <td className="border p-2">
                    {defect.defectProcess?.name || "N/A"}
                  </td>
                  <td className="border p-2">
                    <span
                      className={`inline-block px-2 py-1 rounded text-sm font-semibold ${
                        defect.severity === "High"
                          ? "bg-red-200 text-red-800"
                          : defect.severity === "Medium"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-green-200 text-green-800"
                      }`}
                    >
                      {defect.severity}
                    </span>
                  </td>
                  <td className="border p-2">
                    {defect.detectedDate
                      ? new Date(defect.detectedDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="border p-2">
                    <span
                      className={`inline-block px-2 py-1 rounded text-sm font-semibold ${
                        defect.status === "Resolved"
                          ? "bg-green-200 text-green-800"
                          : defect.status === "In Progress"
                          ? "bg-blue-200 text-blue-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {defect.status}
                    </span>
                  </td>
                  <td className="border p-2">
                    {defect.defectCount || "Unassigned"}
                  </td>
                  {/* <td className="border p-2">{defect.month || "N/A"}</td> */}
                  {/* <td className="border p-2">
                    {defect.detectedDate
                      ? new Date(defect.detectedDate).toLocaleString(
                          "default",
                          { month: "long" }
                        )
                      : "N/A"}
                  </td> */}

                  <td className="border p-2">
                    {defect.productionLine || "N/A"}
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
                                  onClick={() => viewDefectDetails(defect)}
                                  className={`${
                                    active
                                      ? "bg-gray-100 text-gray-900"
                                      : "text-gray-700"
                                  } group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                  <Eye className="mr-2 h-5 w-5" />
                                  View Details
                                </button>
                              )}
                            </Menu.Item>

                            {/* Edit Defect */}
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
                                  <Edit className="mr-2 h-5 w-5" />
                                  Edit
                                </button>
                              )}
                            </Menu.Item>

                            {/* Delete Defect */}
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
                                  <Trash2 className="mr-2 h-5 w-5 text-red-500" />
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
      </div>

      {/* Pagination Controls */}
      {defects.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700">
            Showing page {pagination.page} of {pagination.totalPages}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded ${
                pagination.page === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              First
            </button>

            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded ${
                pagination.page === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              Previous
            </button>

            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                // Show pages around current page
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
                      className={`px-3 py-1 rounded ${
                        pagination.page === pageNumber
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-gray-700 hover:bg-gray-400"
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
              className={`px-3 py-1 rounded ${
                pagination.page === pagination.totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              Next
            </button>

            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className={`px-3 py-1 rounded ${
                pagination.page === pagination.totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              Last
            </button>
          </div>

          <div className="flex items-center">
            <label className="text-sm mr-2">Items per page:</label>
            <select
              value={pagination.limit}
              onChange={(e) =>
                setPagination({
                  ...pagination,
                  page: 1,
                  limit: Number(e.target.value),
                })
              }
              className="border rounded p-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
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
