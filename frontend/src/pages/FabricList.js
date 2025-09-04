import { useState, useEffect } from "react";
import {
  fetchFabrics,
  deleteFabric,
  fetchFabricSuppliers,
  downloadTDSFile,
} from "../services/fabricService";
// } from "../services/masterDataService";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  FiEdit,
  FiTrash2,
  FiDownload,
  FiSearch,
  FiFileText,
  FiEye,
  FiPlus,
  FiInfo,
  FiActivity,
  FiX,
} from "react-icons/fi";
import Spinner from "../components/Spinner";
import FabricModal from "../components/FabricModal";

const FabricList = () => {
  const [editFabric, setEditFabric] = useState(null);
  const [fabrics, setFabrics] = useState([]);
  const [filteredFabrics, setFilteredFabrics] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [sort, setSort] = useState({ field: "name", order: "desc" });
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  useEffect(() => {
    const loadFabrics = async () => {
      try {
        const fabricData = await fetchFabrics({
          page: pagination.page,
          limit: pagination.limit,
          sortField: sort.field,
          sortOrder: sort.order,
          search,
          supplier: selectedSupplier,
        });
        setFabrics(fabricData.data);
        setFilteredFabrics(fabricData.data);
        setPagination((prev) => ({
          ...prev,
          totalPages: fabricData.pagination.totalPages,
        }));
      } catch (error) {
        console.error("Error loading fabrics:", error);
        setIsLoading(false);
      }
    };
    loadFabrics();
    fetchFabricSuppliers().then(setSuppliers);
    setIsLoading(false);
  }, [pagination.page, pagination.limit, sort, search, selectedSupplier]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [selectedSupplier, search, sort]);

  const exportToExcel = () => {
    if (!fabrics || fabrics.length === 0) {
      toast.warning("No data available to export.");
      return;
    }

    const worksheetData = fabrics.map((fabric) => ({
      Name: fabric.name,
      Code: fabric.code,
      Color: fabric.color,
      Supplier: fabric.supplier?.name || "N/A",
      Composition: fabric.compositionString || "N/A",
      "Tensile Warp (g)": fabric.technicalSpecs?.tensileWarp || "N/A",
      "Tensile Weft (g)": fabric.technicalSpecs?.tensileWeft || "N/A",
      "Tear Warp (g)": fabric.technicalSpecs?.tearWarp || "N/A",
      "Tear Weft (g)": fabric.technicalSpecs?.tearWeft || "N/A",
      "Weight (oz/y²)": fabric.technicalSpecs?.weight || "N/A",
      "Elasticity (%)": fabric.technicalSpecs?.elasticity || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fabrics");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(dataBlob, "Enhanced_Fabrics.xlsx");
    toast.success("Fabrics exported successfully to Excel");
  };

  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  /**
   * Benefits:
              Single source of truth (fabrics)
              Automatic filtering
              No sync issues
              More performant (memoized)
   */
  // Remove filteredFabrics state and derive it directly
  // const filteredFabrics = useMemo(() => {
  //   return fabrics.filter((fabric) => {
  //     const matchesSupplier =
  //       !selectedSupplier || fabric.supplier?._id === selectedSupplier;
  //     const matchesSearch =
  //       !search ||
  //       fabric.name.toLowerCase().includes(search.toLowerCase()) ||
  //       fabric.code?.toLowerCase().includes(search.toLowerCase());
  //     return matchesSupplier && matchesSearch;
  //   });
  // }, [fabrics, selectedSupplier, search]);

  const updateFabricList = async (updatedFabric) => {
    if (!updatedFabric || !updatedFabric._id) {
      console.error("Invalid updated fabric:", updatedFabric);
      toast.error("Invalid updated fabric");
      return;
    }
    setFabrics((prevFabrics) => {
      const fabricExists = prevFabrics.some(
        (fabric) => fabric._id === updatedFabric._id
      );

      const updatedList = fabricExists
        ? prevFabrics.map((fabric) =>
            fabric._id === updatedFabric._id ? updatedFabric : fabric
          )
        : [...prevFabrics, updatedFabric];

      // Also update filteredFabrics
      setFilteredFabrics(updatedList);

      return updatedList;
    });
  };

  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteFabric(deleteId);
      setFabrics(fabrics.filter((fabric) => fabric._id !== deleteId));
      setFilteredFabrics((prev) =>
        prev.filter((fabric) => fabric._id !== deleteId)
      );
      toast.success("Fabric deleted successfully");
    } catch (error) {
      // toast.error("Error deleting fabric");
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const openEditModal = (fabric) => {
    setEditFabric(fabric);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditFabric(null);
    setIsModalOpen(false);
  };

  const openModal = () => setIsModalOpen(true);
  const closeConfirm = () => setIsConfirmOpen(false);

  const openDetailModal = (fabric) => {
    setSelectedFabric(fabric);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedFabric(null);
    setIsDetailModalOpen(false);
  };

  const downloadTDS = async (fabric) => {
    if (fabric.tdsFile && fabric.tdsFile.fileName) {
      try {
        // Use the service function to download via API
        await downloadTDSFile(fabric._id, fabric.tdsFile.fileName);
        toast.success("TDS download started");
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Failed to download TDS file");
      }
    } else {
      toast.warning("No TDS file available for this fabric");
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Fabric Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your fabric inventory with technical specifications
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                Export Excel
              </Button>

              <Button
                onClick={openModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Fabric
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters and Search */}
        <Card className="p-6 mb-6 bg-white shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search fabrics by name, code, or color..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                <option value="">All Suppliers</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>

              <Button
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "table" : "grid")
                }
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
              >
                {viewMode === "grid" ? "Table View" : "Grid View"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Content */}
        {viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFabrics?.map((fabric) => (
              <Card
                key={fabric._id}
                className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                {/* Accent Bar */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1"></div>

                {/* Main Content */}
                <div className="p-6 flex flex-col gap-4 flex-grow">
                  {/* Fabric Name & Code */}
                  <div>
                    <h3
                      className="font-bold text-lg text-gray-900 break-words"
                      title={fabric.name}
                    >
                      {fabric.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {fabric.code || "No Code"}
                    </p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Color:
                      </span>
                      <div className="text-gray-900">
                        {fabric.color || "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Supplier:
                      </span>
                      <div className="text-gray-900 break-words">
                        {fabric.supplier?.name || "N/A"}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-medium text-gray-500">
                        Composition:
                      </span>
                      <p className="text-gray-900 mt-1 line-clamp-2">
                        {fabric.compositionString || "No Composition"}
                      </p>
                    </div>
                  </div>

                  {/* Technical Specs */}
                  {fabric.technicalSpecs && (
                    <div className="bg-gray-50 p-3 rounded-lg text-xs grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500">Weight:</span>
                        <span className="ml-1 font-medium">
                          {fabric.technicalSpecs.weight || "N/A"} oz/y²
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Elasticity:</span>
                        <span className="ml-1 font-medium">
                          {fabric.technicalSpecs.elasticity || "N/A"}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* TDS File */}
                  {fabric.tdsFile && (
                    <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg text-xs">
                      <div className="flex items-center gap-2 text-blue-800 font-medium">
                        <FiFileText className="w-4 h-4 text-blue-600" />
                        TDS Available
                      </div>
                      <Button
                        onClick={() => downloadTDS(fabric)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded"
                      >
                        <FiDownload className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Action Buttons Row */}
                <div className="px-6 py-3 border-t flex justify-end gap-2 bg-gray-50">
                  <Button
                    onClick={() => openDetailModal(fabric)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-full"
                    title="View Details"
                  >
                    <FiEye className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => openEditModal(fabric)}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-2 rounded-full"
                    title="Edit"
                  >
                    <FiEdit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => openDeleteConfirm(fabric._id)}
                    className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Table View */
          <Card className="bg-white shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th
                      onClick={() => handleSort("name")}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      Fabric Name{" "}
                      {sort.field === "name" &&
                        (sort.order === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      Color
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      Supplier
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      Composition
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      Tech Specs
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      TDS
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFabrics?.map((fabric) => (
                    <tr key={fabric._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {fabric.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {fabric.code || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {fabric.color || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {fabric.supplier?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-48 truncate">
                        {fabric.compositionString || "No Composition"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {fabric.technicalSpecs?.weight ? (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {fabric.technicalSpecs.weight} oz/y²
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {fabric.tdsFile ? (
                          <Button
                            onClick={() => downloadTDS(fabric)}
                            className="bg-green-100 hover:bg-green-200 text-green-700 p-1 rounded"
                          >
                            <FiDownload className="w-4 h-4" />
                          </Button>
                        ) : (
                          <span className="text-gray-400">No TDS</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            onClick={() => openDetailModal(fabric)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded"
                          >
                            <FiEye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => openEditModal(fabric)}
                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-2 rounded"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => openDeleteConfirm(fabric._id)}
                            className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, fabrics.length)} of{" "}
            {fabrics.length} fabrics
          </div>
          <div className="flex gap-2">
            <Button
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              className={`px-4 py-2 rounded-lg ${
                pagination.page === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
              }`}
            >
              Previous
            </Button>
            <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
              {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
              className={`px-4 py-2 rounded-lg ${
                pagination.page === pagination.totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
              }`}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <FabricModal
          closeModal={closeModal}
          editFabric={editFabric}
          refreshFabricList={updateFabricList}
        />
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedFabric && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] bg-white shadow-2xl rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  Fabric Details - {selectedFabric.name}
                </h2>
                <Button
                  onClick={closeDetailModal}
                  className="text-2xl hover:text-gray-200 transition-colors bg-transparent border-none"
                >
                  <FiX />
                </Button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiInfo className="text-blue-600" />
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Name:
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedFabric.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Code:
                      </label>
                      <p className="text-gray-900">
                        {selectedFabric.code || "No Code"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Color:
                      </label>
                      <p className="text-gray-900">
                        {selectedFabric.color || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Supplier:
                      </label>
                      <p className="text-gray-900">
                        {selectedFabric.supplier?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Composition */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiActivity className="text-purple-600" />
                    Composition
                  </h3>
                  <div className="space-y-2">
                    {selectedFabric.fabricCompositions?.map((comp, index) => (
                      <div
                        key={index}
                        className="flex justify-between bg-white p-2 rounded border"
                      >
                        <span className="text-gray-700 flex items-baseline gap-1">
                          <strong className="text-purple-700">
                            {comp.compositionItem?.abbrPrefix}
                          </strong>
                          <sub className="text-xs text-gray-500">
                            {comp.compositionItem?.name}
                          </sub>
                        </span>
                        <span className="font-medium text-purple-600">
                          {comp.value}%
                        </span>
                      </div>
                    )) || <p className="text-gray-500">No composition data</p>}
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="lg:col-span-2 bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiFileText className="text-orange-600" />
                    Technical Specifications
                  </h3>
                  {selectedFabric.technicalSpecs ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">
                          Tensile Warp
                        </label>
                        <p className="text-xl font-bold text-gray-900">
                          {selectedFabric.technicalSpecs.tensileWarp || "N/A"}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            gf
                          </span>
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">
                          Tensile Weft
                        </label>
                        <p className="text-xl font-bold text-gray-900">
                          {selectedFabric.technicalSpecs.tensileWeft || "N/A"}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            gf
                          </span>
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">
                          Tear Warp
                        </label>
                        <p className="text-xl font-bold text-gray-900">
                          {selectedFabric.technicalSpecs.tearWarp || "N/A"}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            gf
                          </span>
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">
                          Tear Weft
                        </label>
                        <p className="text-xl font-bold text-gray-900">
                          {selectedFabric.technicalSpecs.tearWeft || "N/A"}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            gf
                          </span>
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">
                          Weight
                        </label>
                        <p className="text-xl font-bold text-gray-900">
                          {selectedFabric.technicalSpecs.weight || "N/A"}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            oz/y²
                          </span>
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <label className="text-sm font-medium text-gray-600">
                          Elasticity
                        </label>
                        <p className="text-xl font-bold text-gray-900">
                          {selectedFabric.technicalSpecs.elasticity || "N/A"}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            %
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No technical specifications available
                    </p>
                  )}
                </div>

                {/* TDS File */}
                {selectedFabric.tdsFile && (
                  <div className="lg:col-span-2 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FiFileText className="text-green-600" />
                      Technical Data Sheet
                    </h3>
                    <div className="bg-white p-4 rounded-lg border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FiFileText className="text-blue-600 w-8 h-8" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedFabric.tdsFile.fileName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Uploaded:{" "}
                            {new Date(
                              selectedFabric.tdsFile.uploadDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => downloadTDS(selectedFabric)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <FiDownload className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => {
                    closeDetailModal();
                    openEditModal(selectedFabric);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FiEdit className="w-4 h-4" />
                  Edit Fabric
                </Button>
                <Button
                  onClick={closeDetailModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Card className="w-full max-w-md bg-white shadow-2xl rounded-xl overflow-hidden">
            <div className="bg-red-600 text-white px-6 py-4">
              <h2 className="text-lg font-bold">Confirm Deletion</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this fabric? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  onClick={closeConfirm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FabricList;
